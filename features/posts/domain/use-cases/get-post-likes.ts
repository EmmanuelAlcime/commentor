import { assertValidId } from '@/shared/domain/errors';
import type { PostLikes } from '../entities/post-likes';
import type { PostLikeRepository } from '../repositories/post-like-repository';

export class GetPostLikes {
    constructor(private readonly likes: PostLikeRepository) {}

    async execute(postId: number, viewerId: string | null): Promise<PostLikes> {
        assertValidId(postId);
        const [count, likedByViewer] = await Promise.all([
            this.likes.countByPostId(postId),
            viewerId ? this.likes.isLikedBy(postId, viewerId) : false,
        ]);
        return { postId, count, likedByViewer };
    }
}
