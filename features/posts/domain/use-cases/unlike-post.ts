import { assertValidId } from '@/shared/domain/errors';
import type { PostLikeRepository } from '../repositories/post-like-repository';

export type UnlikePostInput = {
    postId: number;
    userId: string;
};

export class UnlikePost {
    constructor(private readonly likes: PostLikeRepository) {}

    async execute({ postId, userId }: UnlikePostInput): Promise<void> {
        assertValidId(postId);
        await this.likes.remove(postId, userId);
    }
}
