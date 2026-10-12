import { assertValidId } from '@/shared/domain/errors';
import type { CommentRepository } from '../repositories/comment-repository';

export type UnlikeCommentInput = {
    commentId: number;
    userId: string;
};

// No existence check: unliking a comment that was just deleted is harmless and shouldn't fail
export class UnlikeComment {
    constructor(private readonly comments: CommentRepository) {}

    async execute({ commentId, userId }: UnlikeCommentInput): Promise<void> {
        assertValidId(commentId);
        await this.comments.removeLike(commentId, userId);
    }
}
