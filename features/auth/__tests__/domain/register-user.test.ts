import { describe, expect, it } from 'vitest';
import { EmailAlreadyRegisteredError, InvalidRegistrationError } from '@/features/auth/domain/errors';
import { RegisterUser } from '@/features/auth/domain/use-cases/register-user';
import { InMemoryAuthRepository, makeAuthUser } from './fake-auth-repository';

const valid = { name: 'Jane Doe', email: 'jane@example.com', password: 'correct-horse', confirmPassword: 'correct-horse' };
const stored = { name: 'Jane Doe', email: 'jane@example.com', password: 'correct-horse' };

describe('RegisterUser', () => {
    it('registers the user and signs them in', async () => {
        const repository = new InMemoryAuthRepository();
        const user = await new RegisterUser(repository).execute(valid);

        expect(user).toMatchObject({ name: 'Jane Doe', email: 'jane@example.com' });
        expect(repository.currentUser).toEqual(user);
    });

    it('trims the name and normalizes the email before registering', async () => {
        const repository = new InMemoryAuthRepository();
        await new RegisterUser(repository).execute({ ...valid, name: '  Jane Doe ', email: ' Jane@Example.COM ' });

        expect(repository.registrations).toEqual([stored]);
    });

    it('does not trim the password', async () => {
        const repository = new InMemoryAuthRepository();
        await new RegisterUser(repository).execute({ ...valid, password: ' spaced pass ', confirmPassword: ' spaced pass ' });

        expect(repository.registrations[0].password).toBe(' spaced pass ');
    });

    it.each([
        ['name', { name: '   ' }, 'Enter your name'],
        ['name', { name: 'a'.repeat(256) }, 'Name must be 255 characters or fewer'],
        ['email', { email: 'not-an-email' }, 'Enter a valid email address'],
        ['email', { email: '' }, 'Enter a valid email address'],
        ['password', { password: 'short', confirmPassword: 'short' }, 'Password must be at least 8 characters'],
        ['password', { password: 'a'.repeat(129), confirmPassword: 'a'.repeat(129) }, 'Password must be 128 characters or fewer'],
        ['confirmPassword', { confirmPassword: 'different-horse' }, 'Passwords do not match'],
        ['confirmPassword', { confirmPassword: '' }, 'Passwords do not match'],
    ] as const)('rejects an invalid %s', async (field, override, message) => {
        const repository = new InMemoryAuthRepository();
        const error = await new RegisterUser(repository).execute({ ...valid, ...override }).catch((e: unknown) => e);

        expect(error).toBeInstanceOf(InvalidRegistrationError);
        expect((error as InvalidRegistrationError).fieldErrors).toEqual({ [field]: message });
        expect(repository.registrations).toEqual([]);
    });

    it('reports every invalid field at once', async () => {
        const error = await new RegisterUser(new InMemoryAuthRepository())
            .execute({ name: '', email: 'nope', password: '', confirmPassword: 'x' })
            .catch((e: unknown) => e);

        expect((error as InvalidRegistrationError).fieldErrors).toEqual({
            name: 'Enter your name',
            email: 'Enter a valid email address',
            password: 'Password must be at least 8 characters',
            confirmPassword: 'Passwords do not match',
        });
    });

    it('compares the confirmation exactly, without trimming', async () => {
        const error = await new RegisterUser(new InMemoryAuthRepository())
            .execute({ ...valid, confirmPassword: 'correct-horse ' })
            .catch((e: unknown) => e);

        expect((error as InvalidRegistrationError).fieldErrors).toEqual({ confirmPassword: 'Passwords do not match' });
    });

    it('accepts a password of exactly the minimum length', async () => {
        await expect(
            new RegisterUser(new InMemoryAuthRepository()).execute({ ...valid, password: '12345678', confirmPassword: '12345678' }),
        ).resolves.toBeDefined();
    });

    it('throws EmailAlreadyRegisteredError when the email is taken', async () => {
        const repository = new InMemoryAuthRepository([{ user: makeAuthUser(), password: 'whatever1' }]);

        await expect(new RegisterUser(repository).execute(valid)).rejects.toBeInstanceOf(EmailAlreadyRegisteredError);
    });
});
