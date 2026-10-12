import { describe, expect, it } from 'vitest';
import { InvalidCredentialsError } from '@/features/auth/domain/errors';
import { SignInUser } from '@/features/auth/domain/use-cases/sign-in-user';
import { InMemoryAuthRepository, makeAuthUser } from './fake-auth-repository';

const jane = makeAuthUser();
const makeRepository = () => new InMemoryAuthRepository([{ user: jane, password: 'correct-horse' }]);

describe('SignInUser', () => {
    it('signs in with the right credentials', async () => {
        const repository = makeRepository();

        await expect(new SignInUser(repository).execute({ email: jane.email, password: 'correct-horse' })).resolves.toEqual(jane);
        expect(repository.currentUser).toEqual(jane);
    });

    it('normalizes the email before signing in', async () => {
        await expect(
            new SignInUser(makeRepository()).execute({ email: '  JANE@example.com ', password: 'correct-horse' }),
        ).resolves.toEqual(jane);
    });

    it('throws InvalidCredentialsError for a wrong password', async () => {
        await expect(
            new SignInUser(makeRepository()).execute({ email: jane.email, password: 'wrong-password' }),
        ).rejects.toBeInstanceOf(InvalidCredentialsError);
    });

    it('throws InvalidCredentialsError for an unknown email', async () => {
        await expect(
            new SignInUser(makeRepository()).execute({ email: 'nobody@example.com', password: 'correct-horse' }),
        ).rejects.toBeInstanceOf(InvalidCredentialsError);
    });

    it.each([
        { email: '', password: 'correct-horse' },
        { email: '   ', password: 'correct-horse' },
        { email: jane.email, password: '' },
    ])('throws InvalidCredentialsError for blank input %o', async (credentials) => {
        await expect(new SignInUser(makeRepository()).execute(credentials)).rejects.toBeInstanceOf(InvalidCredentialsError);
    });
});
