import { assertValidId } from '@/shared/domain/errors';
import { PostNotFoundError } from '../errors';
import type { PostLikeRepository } from '../repositories/post-like-repository';
import type { PostRepository } from '../repositories/post-repository';

export type LikePostInput = {
    postId: number;
    userId: string;
};

export class LikePost {
    constructor(
        private readonly posts: PostRepository,
        private readonly likes: PostLikeRepository,
    ) {}

    async execute({ postId, userId }: LikePostInput): Promise<void> {
        assertValidId(postId);
        if (!(await this.posts.findById(postId))) {
            throw new PostNotFoundError(postId);
        }
        await this.likes.add(postId, userId);
    }
}
