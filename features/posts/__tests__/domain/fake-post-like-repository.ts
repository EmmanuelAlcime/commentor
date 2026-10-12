import type { PostLikeRepository } from '@/features/posts/domain/repositories/post-like-repository';

export class InMemoryPostLikeRepository implements PostLikeRepository {
    // Each like is stored as "postId:userId"
    readonly likes = new Set<string>();

    async countByPostId(postId: number): Promise<number> {
        return [...this.likes].filter((key) => key.startsWith(`${postId}:`)).length;
    }

    async isLikedBy(postId: number, userId: string): Promise<boolean> {
        return this.likes.has(`${postId}:${userId}`);
    }

    async add(postId: number, userId: string): Promise<void> {
        this.likes.add(`${postId}:${userId}`);
    }

    async remove(postId: number, userId: string): Promise<void> {
        this.likes.delete(`${postId}:${userId}`);
    }
}
