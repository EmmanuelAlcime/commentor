import type { CommentHistoryItem } from '../entities/comment';
import { InvalidAuthorIdError } from '../errors';
import type { CommentRepository } from '../repositories/comment-repository';

// The signed-in user's own comment history, for the profile page
export class GetAuthorCommentHistory {
    constructor(private readonly comments: CommentRepository) {}

    async execute(authorId: string): Promise<CommentHistoryItem[]> {
        if (typeof authorId !== 'string' || authorId.trim() === '') {
            throw new InvalidAuthorIdError(authorId);
        }
        return this.comments.findHistoryByAuthorId(authorId);
    }
}
