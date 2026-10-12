import { assertValidId } from '@/shared/domain/errors';
import type { Comment } from '../entities/comment';
import type { CommentRepository } from '../repositories/comment-repository';

export class GetUserComments {
    constructor(private readonly comments: CommentRepository) {}

    async execute(userId: number): Promise<Comment[]> {
        assertValidId(userId);
        return this.comments.findByUserId(userId);
    }
}
