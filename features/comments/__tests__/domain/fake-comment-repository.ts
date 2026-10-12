import type { Comment } from '@/features/comments/domain/entities/comment';
import type { CommentRepository } from '@/features/comments/domain/repositories/comment-repository';

export class InMemoryCommentRepository implements CommentRepository {
    constructor(private readonly comments: Comment[] = []) {}

    async findById(id: number): Promise<Comment | null> {
        return this.comments.find((comment) => comment.id === id) ?? null;
    }

    async findByPostId(postId: number): Promise<Comment[]> {
        return this.comments.filter((comment) => comment.postId === postId);
    }

    async findByUserId(userId: number): Promise<Comment[]> {
        return this.comments.filter((comment) => comment.userId === userId);
    }
}

export const makeComment = (overrides: Partial<Comment> = {}): Comment => ({
    id: 1,
    postId: 1,
    userId: 1,
    content: 'Great post!',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
});
