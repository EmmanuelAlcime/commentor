import { describe, expect, it } from 'vitest';
import { IncorrectPasswordError, InvalidProfileInputError } from '@/features/profile/domain/errors';
import { DeleteAccount } from '@/features/profile/domain/use-cases/delete-account';
import { InMemoryProfileRepository } from './fake-profile-repository';

describe('DeleteAccount', () => {
    it('deletes the account when the password is right', async () => {
        const repository = new InMemoryProfileRepository();
        await new DeleteAccount(repository).execute({ password: 'correct-horse' });

        expect(repository.deleted).toBe(true);
        expect(repository.current).toBeNull();
    });

    it('throws IncorrectPasswordError and keeps the account when the password is wrong', async () => {
        const repository = new InMemoryProfileRepository();

        await expect(new DeleteAccount(repository).execute({ password: 'wrong' })).rejects.toBeInstanceOf(IncorrectPasswordError);
        expect(repository.deleted).toBe(false);
    });

    it('requires a password rather than relying on the session', async () => {
        const repository = new InMemoryProfileRepository();
        const error = await new DeleteAccount(repository).execute({ password: '' }).catch((e: unknown) => e);

        expect(error).toBeInstanceOf(InvalidProfileInputError);
        expect((error as InvalidProfileInputError).fieldErrors).toEqual({ password: 'Enter your password to delete your account' });
        expect(repository.deleted).toBe(false);
    });
});
