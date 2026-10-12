import { describe, expect, it } from 'vitest';
import { UnlikeComment } from '@/features/comments/domain/use-cases/unlike-comment';
import { InvalidIdError } from '@/shared/domain/errors';
import { InMemoryCommentRepository, makeComment } from './fake-comment-repository';

describe('UnlikeComment', () => {
    it('removes only this user’s like', async () => {
        const comments = new InMemoryCommentRepository([makeComment({ id: 1 })]);
        comments.likes.add('1:user-1');
        comments.likes.add('1:user-2');

        await new UnlikeComment(comments).execute({ commentId: 1, userId: 'user-1' });

        expect([...comments.likes]).toEqual(['1:user-2']);
    });

    it('does nothing when the user had not liked the comment', async () => {
        const comments = new InMemoryCommentRepository([makeComment({ id: 1 })]);

        await expect(new UnlikeComment(comments).execute({ commentId: 1, userId: 'user-1' })).resolves.toBeUndefined();
    });

    it('does not fail for a comment that no longer exists', async () => {
        await expect(
            new UnlikeComment(new InMemoryCommentRepository()).execute({ commentId: 1, userId: 'user-1' }),
        ).resolves.toBeUndefined();
    });

    it('throws InvalidIdError for an invalid id', async () => {
        await expect(
            new UnlikeComment(new InMemoryCommentRepository()).execute({ commentId: Number.NaN, userId: 'user-1' }),
        ).rejects.toBeInstanceOf(InvalidIdError);
    });
});
