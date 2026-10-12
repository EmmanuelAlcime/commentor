import { AVATAR_MAX_BYTES, type AvatarImage, avatarUrl, detectImageType } from '../entities/avatar';
import { InvalidAvatarError } from '../errors';
import type { AvatarRepository } from '../repositories/avatar-repository';
import type { ProfileRepository } from '../repositories/profile-repository';

export type UploadAvatarInput = {
    userId: string;
    data: Uint8Array;
};

export class UploadAvatar {
    // `now` is injectable so tests can pin the version in the picture URL
    constructor(
        private readonly avatars: AvatarRepository,
        private readonly profiles: ProfileRepository,
        private readonly now: () => Date = () => new Date(),
    ) {}

    async execute({ userId, data }: UploadAvatarInput): Promise<AvatarImage> {
        if (data.length === 0) {
            throw new InvalidAvatarError('empty');
        }
        if (data.length > AVATAR_MAX_BYTES) {
            throw new InvalidAvatarError('too-large');
        }
        const contentType = detectImageType(data);
        if (!contentType) {
            throw new InvalidAvatarError('unsupported-type');
        }

        const avatar: AvatarImage = { userId, contentType, data, updatedAt: this.now() };
        await this.avatars.save(avatar);
        await this.profiles.setImage(avatarUrl(userId, avatar.updatedAt));
        return avatar;
    }
}
