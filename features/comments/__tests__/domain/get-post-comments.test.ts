import { describe, expect, it } from 'vitest';
import { GetPostComments } from '@/features/comments/domain/use-cases/get-post-comments';
import { InvalidIdError } from '@/shared/domain/errors';
import { InMemoryCommentRepository, makeComment } from './fake-comment-repository';

describe('GetPostComments', () => {
    const repository = () => {
        const comments = new InMemoryCommentRepository(
            [
                makeComment({ id: 1, postId: 1, createdAt: new Date('2026-01-01') }),
                makeComment({ id: 2, postId: 2 }),
                makeComment({ id: 3, postId: 1, createdAt: new Date('2026-01-02') }),
                makeComment({ id: 4, postId: 1, parentId: 1, authorId: 'user-1' }),
            ],
            { authorNames: { 'user-1': 'Ada' } },
        );
        comments.likes.add('1:viewer');
        comments.likes.add('1:someone-else');
        return comments;
    };

    it('returns only the post’s comments, nested and sorted', async () => {
        const tree = await new GetPostComments(repository()).execute({ postId: 1, viewerId: null, sort: 'newest' });

        expect(tree.map((node) => node.id)).toEqual([3, 1]);
        expect(tree[1].replies.map((node) => node.id)).toEqual([4]);
        expect(tree[1].replies[0].authorName).toBe('Ada');
    });

    it('applies the requested sort', async () => {
        const tree = await new GetPostComments(repository()).execute({ postId: 1, viewerId: null, sort: 'top' });

        expect(tree.map((node) => node.id)).toEqual([1, 3]);
    });

    it('marks the comments the viewer liked', async () => {
        const tree = await new GetPostComments(repository()).execute({ postId: 1, viewerId: 'viewer', sort: 'top' });

        expect(tree[0]).toMatchObject({ id: 1, likeCount: 2, likedByViewer: true });
        expect(tree[1]).toMatchObject({ id: 3, likeCount: 0, likedByViewer: false });
    });

    it('marks nothing as liked for a signed-out viewer', async () => {
        const tree = await new GetPostComments(repository()).execute({ postId: 1, viewerId: null, sort: 'top' });

        expect(tree[0]).toMatchObject({ likeCount: 2, likedByViewer: false });
    });

    it('returns an empty list for a post with no comments', async () => {
        await expect(new GetPostComments(repository()).execute({ postId: 42, viewerId: null, sort: 'newest' })).resolves.toEqual([]);
    });

    it('throws InvalidIdError for an invalid post id', async () => {
        await expect(
            new GetPostComments(repository()).execute({ postId: -1, viewerId: null, sort: 'newest' }),
        ).rejects.toBeInstanceOf(InvalidIdError);
    });
});
