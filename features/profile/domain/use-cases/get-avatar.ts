import type { AvatarImage } from '../entities/avatar';
import type { AvatarRepository } from '../repositories/avatar-repository';

// Public: anyone may load another user's picture, since it shows next to their comments
export class GetAvatar {
    constructor(private readonly avatars: AvatarRepository) {}

    async execute(userId: string): Promise<AvatarImage | null> {
        if (typeof userId !== 'string' || userId.trim() === '') {
            return null;
        }
        return this.avatars.find(userId);
    }
}
