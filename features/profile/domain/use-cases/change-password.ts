import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '@/features/auth/domain/entities/auth-user';
import { InvalidProfileInputError, type ProfileFieldErrors } from '../errors';
import type { ProfileRepository } from '../repositories/profile-repository';

export type ChangePasswordInput = {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
};

export class ChangePassword {
    constructor(private readonly profiles: ProfileRepository) {}

    async execute(input: ChangePasswordInput): Promise<void> {
        const fieldErrors: ProfileFieldErrors = {};
        if (!input.currentPassword) {
            fieldErrors.currentPassword = 'Enter your current password';
        }
        if (input.newPassword.length < PASSWORD_MIN_LENGTH) {
            fieldErrors.newPassword = `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
        } else if (input.newPassword.length > PASSWORD_MAX_LENGTH) {
            fieldErrors.newPassword = `Password must be ${PASSWORD_MAX_LENGTH} characters or fewer`;
        } else if (input.newPassword === input.currentPassword) {
            fieldErrors.newPassword = 'New password must be different from the current one';
        }
        if (input.confirmPassword !== input.newPassword) {
            fieldErrors.confirmPassword = 'Passwords do not match';
        }
        if (Object.keys(fieldErrors).length > 0) {
            throw new InvalidProfileInputError(fieldErrors);
        }
        await this.profiles.changePassword(input.currentPassword, input.newPassword);
    }
}
