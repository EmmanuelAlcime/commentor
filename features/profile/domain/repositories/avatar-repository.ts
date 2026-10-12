import type { AvatarImage } from '../entities/avatar';

export interface AvatarRepository {
    find(userId: string): Promise<AvatarImage | null>;
    // Replaces any existing picture for the same user
    save(avatar: AvatarImage): Promise<void>;
    // Does nothing when the user has no picture
    remove(userId: string): Promise<void>;
}
