import { describe, expect, it } from 'vitest';
import { EmailAlreadyRegisteredError, UnauthenticatedError } from '@/features/auth/domain/errors';
import { InvalidProfileInputError } from '@/features/profile/domain/errors';
import { ChangeEmail } from '@/features/profile/domain/use-cases/change-email';
import { InMemoryProfileRepository } from './fake-profile-repository';

describe('ChangeEmail', () => {
    it('normalizes and saves the new email', async () => {
        const repository = new InMemoryProfileRepository();
        await new ChangeEmail(repository).execute({ email: ' Grace@Example.COM ' });
        expect(repository.current?.email).toBe('grace@example.com');
    });

    it.each(['', 'not-an-email', 'a@b'])('rejects invalid email %j', async (email) => {
        const repository = new InMemoryProfileRepository();
        const error = await new ChangeEmail(repository).execute({ email }).catch((e: unknown) => e);

        expect(error).toBeInstanceOf(InvalidProfileInputError);
        expect((error as InvalidProfileInputError).fieldErrors).toEqual({ email: 'Enter a valid email address' });
        expect(repository.current?.email).toBe('jane@example.com');
    });

    it('rejects the address already on the account, ignoring case', async () => {
        const error = await new ChangeEmail(new InMemoryProfileRepository()).execute({ email: 'JANE@example.com' }).catch((e: unknown) => e);

        expect((error as InvalidProfileInputError).fieldErrors).toEqual({ email: 'That is already your email address' });
    });

    it('throws EmailAlreadyRegisteredError when another account uses the address', async () => {
        const repository = new InMemoryProfileRepository(undefined, undefined, { takenEmails: ['grace@example.com'] });

        await expect(new ChangeEmail(repository).execute({ email: 'grace@example.com' })).rejects.toBeInstanceOf(EmailAlreadyRegisteredError);
        expect(repository.current?.email).toBe('jane@example.com');
    });

    it('throws UnauthenticatedError when nobody is signed in', async () => {
        await expect(new ChangeEmail(new InMemoryProfileRepository(null)).execute({ email: 'grace@example.com' })).rejects.toBeInstanceOf(
            UnauthenticatedError,
        );
    });
});
