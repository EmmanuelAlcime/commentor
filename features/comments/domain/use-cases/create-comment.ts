import { PostNotFoundError } from '@/features/posts/domain/errors';
import { assertValidId } from '@/shared/domain/errors';
import { type Comment, validateCommentContent } from '../entities/comment';
import type { CommentRepository } from '../repositories/comment-repository';

export type CreateCommentInput = {
    postId: number;
    authorId: string;
    content: string;
};

export class CreateComment {
    constructor(private readonly comments: CommentRepository) {}

    async execute({ postId, authorId, content }: CreateCommentInput): Promise<Comment> {
        assertValidId(postId);
        const validContent = validateCommentContent(content);

        if (!(await this.comments.postExists(postId))) {
            throw new PostNotFoundError(postId);
        }

        return this.comments.create({ postId, parentId: null, authorId, content: validContent, createdAt: new Date() });
    }
}
