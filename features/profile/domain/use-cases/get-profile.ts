import { UnauthenticatedError } from '@/features/auth/domain/errors';
import type { Profile } from '../entities/profile';
import type { ProfileRepository } from '../repositories/profile-repository';

export class GetProfile {
    constructor(private readonly profiles: ProfileRepository) {}

    async execute(): Promise<Profile> {
        const profile = await this.profiles.getCurrent();
        if (!profile) {
            throw new UnauthenticatedError();
        }
        return profile;
    }
}
