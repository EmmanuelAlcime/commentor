import { describe, expect, it } from 'vitest';
import { CommentNotFoundError, NotCommentAuthorError } from '@/features/comments/domain/errors';
import { DeleteComment } from '@/features/comments/domain/use-cases/delete-comment';
import { InvalidIdError } from '@/shared/domain/errors';
import { InMemoryCommentRepository, makeComment } from './fake-comment-repository';

describe('DeleteComment', () => {
    const repository = () =>
        new InMemoryCommentRepository([
            makeComment({ id: 1, authorId: 'user-1' }),
            makeComment({ id: 2, parentId: 1, authorId: 'user-2' }),
            makeComment({ id: 3, parentId: 2, authorId: 'user-3' }),
            makeComment({ id: 4, authorId: 'user-2' }),
            makeComment({ id: 5, authorId: null }),
        ]);

    const remainingIds = (comments: InMemoryCommentRepository) => comments.comments.map((comment) => comment.id);

    it('deletes the author’s comment and every reply under it, including other users’ replies', async () => {
        const comments = repository();

        await new DeleteComment(comments).execute({ commentId: 1, userId: 'user-1' });

        expect(remainingIds(comments)).toEqual([4, 5]);
    });

    it('lets the author of a reply delete just that branch', async () => {
        const comments = repository();

        await new DeleteComment(comments).execute({ commentId: 2, userId: 'user-2' });

        expect(remainingIds(comments)).toEqual([1, 4, 5]);
    });

    it('removes likes on the deleted comments', async () => {
        const comments = repository();
        comments.likes.add('3:user-9');
        comments.likes.add('4:user-9');

        await new DeleteComment(comments).execute({ commentId: 1, userId: 'user-1' });

        expect([...comments.likes]).toEqual(['4:user-9']);
    });

    it('throws NotCommentAuthorError for someone else’s comment and deletes nothing', async () => {
        const comments = repository();

        await expect(new DeleteComment(comments).execute({ commentId: 1, userId: 'user-2' })).rejects.toBeInstanceOf(
            NotCommentAuthorError,
        );
        expect(remainingIds(comments)).toEqual([1, 2, 3, 4, 5]);
    });

    it('throws NotCommentAuthorError for a seeded comment', async () => {
        await expect(new DeleteComment(repository()).execute({ commentId: 5, userId: 'user-1' })).rejects.toBeInstanceOf(
            NotCommentAuthorError,
        );
    });

    it('throws CommentNotFoundError when the comment does not exist', async () => {
        await expect(new DeleteComment(repository()).execute({ commentId: 99, userId: 'user-1' })).rejects.toBeInstanceOf(
            CommentNotFoundError,
        );
    });

    it('throws InvalidIdError for an invalid id', async () => {
        await expect(new DeleteComment(repository()).execute({ commentId: -3, userId: 'user-1' })).rejects.toBeInstanceOf(
            InvalidIdError,
        );
    });
});
