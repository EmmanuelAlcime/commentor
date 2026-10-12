import { PROFILE_NAME_MAX_LENGTH } from '../entities/profile';
import { InvalidProfileInputError } from '../errors';
import type { ProfileRepository } from '../repositories/profile-repository';

export type UpdateProfileNameInput = { name: string };

export class UpdateProfileName {
    constructor(private readonly profiles: ProfileRepository) {}

    async execute(input: UpdateProfileNameInput): Promise<void> {
        const name = input.name.trim();
        if (!name) {
            throw new InvalidProfileInputError({ name: 'Enter your name' });
        }
        if (name.length > PROFILE_NAME_MAX_LENGTH) {
            throw new InvalidProfileInputError({ name: `Name must be ${PROFILE_NAME_MAX_LENGTH} characters or fewer` });
        }
        await this.profiles.updateName(name);
    }
}
