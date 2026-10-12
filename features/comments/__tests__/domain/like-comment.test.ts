import { describe, expect, it } from 'vitest';
import { CommentNotFoundError } from '@/features/comments/domain/errors';
import { LikeComment } from '@/features/comments/domain/use-cases/like-comment';
import { InvalidIdError } from '@/shared/domain/errors';
import { InMemoryCommentRepository, makeComment } from './fake-comment-repository';

describe('LikeComment', () => {
    it('likes the comment for the user', async () => {
        const comments = new InMemoryCommentRepository([makeComment({ id: 1 })]);

        await new LikeComment(comments).execute({ commentId: 1, userId: 'user-1' });

        expect(comments.likes.has('1:user-1')).toBe(true);
    });

    it('is idempotent: liking twice keeps a single like', async () => {
        const comments = new InMemoryCommentRepository([makeComment({ id: 1 })]);
        const useCase = new LikeComment(comments);

        await useCase.execute({ commentId: 1, userId: 'user-1' });
        await useCase.execute({ commentId: 1, userId: 'user-1' });

        expect(comments.likes.size).toBe(1);
    });

    it('lets users like their own comments', async () => {
        const comments = new InMemoryCommentRepository([makeComment({ id: 1, authorId: 'user-1' })]);

        await new LikeComment(comments).execute({ commentId: 1, userId: 'user-1' });

        expect(comments.likes.has('1:user-1')).toBe(true);
    });

    it('throws CommentNotFoundError when the comment does not exist', async () => {
        const comments = new InMemoryCommentRepository();

        await expect(new LikeComment(comments).execute({ commentId: 1, userId: 'user-1' })).rejects.toBeInstanceOf(
            CommentNotFoundError,
        );
        expect(comments.likes.size).toBe(0);
    });

    it('throws InvalidIdError for an invalid id', async () => {
        await expect(
            new LikeComment(new InMemoryCommentRepository()).execute({ commentId: 0, userId: 'user-1' }),
        ).rejects.toBeInstanceOf(InvalidIdError);
    });
});
