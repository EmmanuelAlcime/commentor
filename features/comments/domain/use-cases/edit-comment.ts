import { assertValidId } from '@/shared/domain/errors';
import { isCommentAuthor, validateCommentContent } from '../entities/comment';
import { CommentNotFoundError, NotCommentAuthorError } from '../errors';
import type { CommentRepository } from '../repositories/comment-repository';

export type EditCommentInput = {
    commentId: number;
    userId: string;
    content: string;
};

export class EditComment {
    constructor(private readonly comments: CommentRepository) {}

    async execute({ commentId, userId, content }: EditCommentInput): Promise<void> {
        assertValidId(commentId);

        const comment = await this.comments.findById(commentId);
        if (!comment) {
            throw new CommentNotFoundError(commentId);
        }
        if (!isCommentAuthor(comment, userId)) {
            throw new NotCommentAuthorError(commentId);
        }

        const validContent = validateCommentContent(content);
        // Saving the same text again is not an edit, so it shouldn't earn an "Edited" label
        if (validContent === comment.content) {
            return;
        }

        await this.comments.updateContent(commentId, validContent, new Date());
    }
}
