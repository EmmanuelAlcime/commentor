import { EMAIL_PATTERN, normalizeEmail } from '@/features/auth/domain/entities/auth-user';
import { UnauthenticatedError } from '@/features/auth/domain/errors';
import { InvalidProfileInputError } from '../errors';
import type { ProfileRepository } from '../repositories/profile-repository';

export type ChangeEmailInput = { email: string };

export class ChangeEmail {
    constructor(private readonly profiles: ProfileRepository) {}

    async execute(input: ChangeEmailInput): Promise<void> {
        const email = normalizeEmail(input.email);
        if (!EMAIL_PATTERN.test(email)) {
            throw new InvalidProfileInputError({ email: 'Enter a valid email address' });
        }
        const profile = await this.profiles.getCurrent();
        if (!profile) {
            throw new UnauthenticatedError();
        }
        if (profile.email === email) {
            throw new InvalidProfileInputError({ email: 'That is already your email address' });
        }
        await this.profiles.changeEmail(email);
    }
}
