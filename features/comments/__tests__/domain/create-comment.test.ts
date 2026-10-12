import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InvalidCommentContentError } from '@/features/comments/domain/errors';
import { CreateComment } from '@/features/comments/domain/use-cases/create-comment';
import { PostNotFoundError } from '@/features/posts/domain/errors';
import { InvalidIdError } from '@/shared/domain/errors';
import { InMemoryCommentRepository, makeComment } from './fake-comment-repository';

const NOW = new Date('2026-03-04T05:06:07.000Z');

describe('CreateComment', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(NOW);
    });
    afterEach(() => vi.useRealTimers());

    it('creates a top-level comment for the author with trimmed content', async () => {
        const comments = new InMemoryCommentRepository([makeComment({ id: 7 })], { postIds: [1] });

        const created = await new CreateComment(comments).execute({ postId: 1, authorId: 'user-1', content: '  Hello  ' });

        expect(created).toMatchObject({
            id: 8,
            postId: 1,
            parentId: null,
            authorId: 'user-1',
            content: 'Hello',
            createdAt: NOW,
            editedAt: null,
        });
        expect(comments.comments).toHaveLength(2);
    });

    it('throws PostNotFoundError when the post does not exist', async () => {
        const comments = new InMemoryCommentRepository([], { postIds: [1] });

        await expect(
            new CreateComment(comments).execute({ postId: 2, authorId: 'user-1', content: 'Hello' }),
        ).rejects.toBeInstanceOf(PostNotFoundError);
        expect(comments.comments).toHaveLength(0);
    });

    it('throws InvalidCommentContentError for empty content and saves nothing', async () => {
        const comments = new InMemoryCommentRepository();

        await expect(
            new CreateComment(comments).execute({ postId: 1, authorId: 'user-1', content: '   ' }),
        ).rejects.toBeInstanceOf(InvalidCommentContentError);
        expect(comments.comments).toHaveLength(0);
    });

    it('throws InvalidIdError for an invalid post id', async () => {
        await expect(
            new CreateComment(new InMemoryCommentRepository()).execute({ postId: 0, authorId: 'user-1', content: 'Hello' }),
        ).rejects.toBeInstanceOf(InvalidIdError);
    });
});
