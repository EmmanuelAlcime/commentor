import { assertValidId } from '@/shared/domain/errors';
import { CommentNotFoundError } from '../errors';
import type { CommentRepository } from '../repositories/comment-repository';

export type LikeCommentInput = {
    commentId: number;
    userId: string;
};

export class LikeComment {
    constructor(private readonly comments: CommentRepository) {}

    async execute({ commentId, userId }: LikeCommentInput): Promise<void> {
        assertValidId(commentId);
        if (!(await this.comments.findById(commentId))) {
            throw new CommentNotFoundError(commentId);
        }
        await this.comments.addLike(commentId, userId);
    }
}
