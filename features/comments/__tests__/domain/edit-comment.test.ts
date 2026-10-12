import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CommentNotFoundError, InvalidCommentContentError, NotCommentAuthorError } from '@/features/comments/domain/errors';
import { EditComment } from '@/features/comments/domain/use-cases/edit-comment';
import { InvalidIdError } from '@/shared/domain/errors';
import { InMemoryCommentRepository, makeComment } from './fake-comment-repository';

const NOW = new Date('2026-03-04T05:06:07.000Z');

describe('EditComment', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(NOW);
    });
    afterEach(() => vi.useRealTimers());

    const repository = () =>
        new InMemoryCommentRepository([
            makeComment({ id: 1, authorId: 'user-1', content: 'Original' }),
            makeComment({ id: 2, authorId: null, userId: 3 }),
        ]);

    it('updates the author’s comment and records when it was edited', async () => {
        const comments = repository();

        await new EditComment(comments).execute({ commentId: 1, userId: 'user-1', content: '  Updated  ' });

        expect(await comments.findById(1)).toMatchObject({ content: 'Updated', editedAt: NOW });
    });

    it('does not mark the comment edited when the text is unchanged', async () => {
        const comments = repository();

        await new EditComment(comments).execute({ commentId: 1, userId: 'user-1', content: ' Original ' });

        expect(await comments.findById(1)).toMatchObject({ content: 'Original', editedAt: null });
    });

    it('throws NotCommentAuthorError for someone else’s comment', async () => {
        const comments = repository();

        await expect(
            new EditComment(comments).execute({ commentId: 1, userId: 'user-2', content: 'Hijacked' }),
        ).rejects.toBeInstanceOf(NotCommentAuthorError);
        expect(await comments.findById(1)).toMatchObject({ content: 'Original' });
    });

    it('throws NotCommentAuthorError for a seeded comment', async () => {
        await expect(
            new EditComment(repository()).execute({ commentId: 2, userId: 'user-1', content: 'Hi' }),
        ).rejects.toBeInstanceOf(NotCommentAuthorError);
    });

    it('throws CommentNotFoundError when the comment does not exist', async () => {
        await expect(
            new EditComment(repository()).execute({ commentId: 99, userId: 'user-1', content: 'Hi' }),
        ).rejects.toBeInstanceOf(CommentNotFoundError);
    });

    it('throws InvalidCommentContentError for empty content and keeps the original', async () => {
        const comments = repository();

        await expect(
            new EditComment(comments).execute({ commentId: 1, userId: 'user-1', content: '  ' }),
        ).rejects.toBeInstanceOf(InvalidCommentContentError);
        expect(await comments.findById(1)).toMatchObject({ content: 'Original', editedAt: null });
    });

    it('throws InvalidIdError for an invalid id', async () => {
        await expect(
            new EditComment(repository()).execute({ commentId: 0, userId: 'user-1', content: 'Hi' }),
        ).rejects.toBeInstanceOf(InvalidIdError);
    });
});
