import { assertValidId } from '@/shared/domain/errors';
import { isCommentAuthor } from '../entities/comment';
import { CommentNotFoundError, NotCommentAuthorError } from '../errors';
import type { CommentRepository } from '../repositories/comment-repository';

export type DeleteCommentInput = {
    commentId: number;
    userId: string;
};

// Deleting a comment removes the whole thread under it, including other users' replies
export class DeleteComment {
    constructor(private readonly comments: CommentRepository) {}

    async execute({ commentId, userId }: DeleteCommentInput): Promise<void> {
        assertValidId(commentId);

        const comment = await this.comments.findById(commentId);
        if (!comment) {
            throw new CommentNotFoundError(commentId);
        }
        if (!isCommentAuthor(comment, userId)) {
            throw new NotCommentAuthorError(commentId);
        }

        await this.comments.deleteThread(commentId);
    }
}
