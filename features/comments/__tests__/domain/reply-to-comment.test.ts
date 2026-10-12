import { describe, expect, it } from 'vitest';
import { CommentNotFoundError, InvalidCommentContentError } from '@/features/comments/domain/errors';
import { ReplyToComment } from '@/features/comments/domain/use-cases/reply-to-comment';
import { InvalidIdError } from '@/shared/domain/errors';
import { InMemoryCommentRepository, makeComment } from './fake-comment-repository';

describe('ReplyToComment', () => {
    const repository = () =>
        new InMemoryCommentRepository([
            makeComment({ id: 1, postId: 5, authorId: 'someone-else' }),
            makeComment({ id: 2, postId: 5, parentId: 1 }),
            makeComment({ id: 3, postId: null }),
        ]);

    it('replies on the parent’s post, linked to the parent', async () => {
        const comments = repository();

        const reply = await new ReplyToComment(comments).execute({ parentId: 1, authorId: 'user-1', content: ' Agreed ' });

        expect(reply).toMatchObject({ postId: 5, parentId: 1, authorId: 'user-1', content: 'Agreed' });
    });

    it('allows replying to a reply, so threads can nest', async () => {
        const reply = await new ReplyToComment(repository()).execute({ parentId: 2, authorId: 'user-1', content: 'Deeper' });

        expect(reply).toMatchObject({ postId: 5, parentId: 2 });
    });

    it('allows replying to your own comment', async () => {
        const comments = new InMemoryCommentRepository([makeComment({ id: 1, authorId: 'user-1' })]);

        await expect(
            new ReplyToComment(comments).execute({ parentId: 1, authorId: 'user-1', content: 'Update' }),
        ).resolves.toMatchObject({ parentId: 1 });
    });

    it('throws CommentNotFoundError when the parent does not exist', async () => {
        await expect(
            new ReplyToComment(repository()).execute({ parentId: 99, authorId: 'user-1', content: 'Hi' }),
        ).rejects.toBeInstanceOf(CommentNotFoundError);
    });

    it('throws CommentNotFoundError when the parent is not attached to a post', async () => {
        await expect(
            new ReplyToComment(repository()).execute({ parentId: 3, authorId: 'user-1', content: 'Hi' }),
        ).rejects.toBeInstanceOf(CommentNotFoundError);
    });

    it('throws InvalidCommentContentError for empty content', async () => {
        const comments = repository();

        await expect(
            new ReplyToComment(comments).execute({ parentId: 1, authorId: 'user-1', content: '' }),
        ).rejects.toBeInstanceOf(InvalidCommentContentError);
        expect(comments.comments).toHaveLength(3);
    });

    it('throws InvalidIdError for an invalid parent id', async () => {
        await expect(
            new ReplyToComment(repository()).execute({ parentId: 1.5, authorId: 'user-1', content: 'Hi' }),
        ).rejects.toBeInstanceOf(InvalidIdError);
    });
});
