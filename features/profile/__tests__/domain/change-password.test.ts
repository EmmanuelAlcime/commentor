import { describe, expect, it } from 'vitest';
import { IncorrectPasswordError, InvalidProfileInputError } from '@/features/profile/domain/errors';
import { ChangePassword } from '@/features/profile/domain/use-cases/change-password';
import { InMemoryProfileRepository } from './fake-profile-repository';

const valid = { currentPassword: 'correct-horse', newPassword: 'battery-staple', confirmPassword: 'battery-staple' };

describe('ChangePassword', () => {
    it('changes the password when the current one is right', async () => {
        const repository = new InMemoryProfileRepository();
        await new ChangePassword(repository).execute(valid);
        expect(repository.password).toBe('battery-staple');
    });

    it('throws IncorrectPasswordError when the current password is wrong', async () => {
        const repository = new InMemoryProfileRepository();

        await expect(new ChangePassword(repository).execute({ ...valid, currentPassword: 'nope-nope' })).rejects.toBeInstanceOf(
            IncorrectPasswordError,
        );
        expect(repository.password).toBe('correct-horse');
    });

    it.each([
        ['currentPassword', { currentPassword: '' }, 'Enter your current password'],
        ['newPassword', { newPassword: 'short', confirmPassword: 'short' }, 'Password must be at least 8 characters'],
        ['newPassword', { newPassword: 'a'.repeat(129), confirmPassword: 'a'.repeat(129) }, 'Password must be 128 characters or fewer'],
        ['newPassword', { newPassword: 'correct-horse', confirmPassword: 'correct-horse' }, 'New password must be different from the current one'],
        ['confirmPassword', { confirmPassword: 'battery-stapl' }, 'Passwords do not match'],
    ] as const)('rejects an invalid %s', async (field, override, message) => {
        const repository = new InMemoryProfileRepository();
        const error = await new ChangePassword(repository).execute({ ...valid, ...override }).catch((e: unknown) => e);

        expect(error).toBeInstanceOf(InvalidProfileInputError);
        expect((error as InvalidProfileInputError).fieldErrors).toEqual({ [field]: message });
        expect(repository.password).toBe('correct-horse');
    });

    it('reports every invalid field at once', async () => {
        const error = await new ChangePassword(new InMemoryProfileRepository())
            .execute({ currentPassword: '', newPassword: 'x', confirmPassword: 'y' })
            .catch((e: unknown) => e);

        expect((error as InvalidProfileInputError).fieldErrors).toEqual({
            currentPassword: 'Enter your current password',
            newPassword: 'Password must be at least 8 characters',
            confirmPassword: 'Passwords do not match',
        });
    });
});
