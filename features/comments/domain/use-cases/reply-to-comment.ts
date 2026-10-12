import { assertValidId } from '@/shared/domain/errors';
import { type Comment, validateCommentContent } from '../entities/comment';
import { CommentNotFoundError } from '../errors';
import type { CommentRepository } from '../repositories/comment-repository';

export type ReplyToCommentInput = {
    parentId: number;
    authorId: string;
    content: string;
};

// Replies can be made to any comment or reply, so threads nest without a depth limit
export class ReplyToComment {
    constructor(private readonly comments: CommentRepository) {}

    async execute({ parentId, authorId, content }: ReplyToCommentInput): Promise<Comment> {
        assertValidId(parentId);
        const validContent = validateCommentContent(content);

        const parent = await this.comments.findById(parentId);
        if (!parent || parent.postId === null) {
            throw new CommentNotFoundError(parentId);
        }

        return this.comments.create({
            postId: parent.postId,
            parentId,
            authorId,
            content: validContent,
            createdAt: new Date(),
        });
    }
}
