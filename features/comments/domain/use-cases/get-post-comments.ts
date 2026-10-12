import { assertValidId } from '@/shared/domain/errors';
import type { Comment } from '../entities/comment';
import type { CommentRepository } from '../repositories/comment-repository';

export class GetPostComments {
    constructor(private readonly comments: CommentRepository) {}

    async execute(postId: number): Promise<Comment[]> {
        assertValidId(postId);
        return this.comments.findByPostId(postId);
    }
}
