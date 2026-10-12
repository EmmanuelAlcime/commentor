import type { AvatarRepository } from '../repositories/avatar-repository';
import type { ProfileRepository } from '../repositories/profile-repository';

export class RemoveAvatar {
    constructor(
        private readonly avatars: AvatarRepository,
        private readonly profiles: ProfileRepository,
    ) {}

    async execute(userId: string): Promise<void> {
        await this.avatars.remove(userId);
        await this.profiles.setImage(null);
    }
}
