import { assertValidId } from '@/shared/domain/errors';
import type { Comment } from '../entities/comment';
import { CommentNotFoundError } from '../errors';
import type { CommentRepository } from '../repositories/comment-repository';

export class GetCommentById {
    constructor(private readonly comments: CommentRepository) {}

    async execute(id: number): Promise<Comment> {
        assertValidId(id);
        const comment = await this.comments.findById(id);
        if (!comment) {
            throw new CommentNotFoundError(id);
        }
        return comment;
    }
}
