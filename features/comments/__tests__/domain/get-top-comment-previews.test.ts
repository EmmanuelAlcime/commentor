import { describe, expect, it } from 'vitest';
import { GetTopCommentPreviews } from '@/features/comments/domain/use-cases/get-top-comment-previews';
import { InvalidIdError } from '@/shared/domain/errors';
import { InMemoryCommentRepository, makeComment } from './fake-comment-repository';

const at = (day: number) => new Date(Date.UTC(2026, 0, day));

const setup = async () => {
    const repository = new InMemoryCommentRepository(
        [
            makeComment({ id: 1, postId: 1, authorId: 'user-1', userId: null, content: 'one like', createdAt: at(1) }),
            makeComment({ id: 2, postId: 1, authorId: 'user-2', userId: null, content: 'three likes', createdAt: at(2) }),
            makeComment({ id: 3, postId: 1, parentId: 2, authorId: 'user-1', userId: null, content: 'reply, two likes', createdAt: at(3) }),
            makeComment({ id: 4, postId: 1, content: 'no likes, newest', createdAt: at(4) }),
            makeComment({ id: 5, postId: 2, content: 'lonely', createdAt: at(1) }),
            makeComment({ id: 6, postId: 3, content: 'older tie', createdAt: at(1) }),
            makeComment({ id: 7, postId: 3, content: 'newer tie', createdAt: at(2) }),
        ],
        { postIds: [1, 2, 3], authorNames: { 'user-1': 'Ada', 'user-2': 'Grace' }, authorImages: { 'user-2': '/api/avatars/user-2' } },
    );
    for (const [commentId, likes] of [[1, 1], [2, 3], [3, 2]] as const) {
        for (let i = 0; i < likes; i++) await repository.addLike(commentId, `liker-${i}`);
    }
    return new GetTopCommentPreviews(repository);
};

describe('GetTopCommentPreviews', () => {
    it('returns the most liked comments per post, replies included, two by default', async () => {
        const previews = await (await setup()).execute({ postIds: [1, 2] });

        expect(previews[1].map((p) => p.id)).toEqual([2, 3]);
        expect(previews[2].map((p) => p.id)).toEqual([5]);
    });

    it('carries author details, like count and content', async () => {
        const previews = await (await setup()).execute({ postIds: [1] });

        expect(previews[1][0]).toEqual({
            id: 2,
            postId: 1,
            content: 'three likes',
            authorName: 'Grace',
            authorImage: '/api/avatars/user-2',
            likeCount: 3,
            createdAt: at(2),
        });
    });

    it('breaks like ties by newest first', async () => {
        const previews = await (await setup()).execute({ postIds: [3] });
        expect(previews[3].map((p) => p.id)).toEqual([7, 6]);
    });

    it('honours a custom limit', async () => {
        const previews = await (await setup()).execute({ postIds: [1], limit: 3 });
        expect(previews[1].map((p) => p.id)).toEqual([2, 3, 1]);
    });

    it('leaves out posts without comments and ignores duplicate ids', async () => {
        const previews = await (await setup()).execute({ postIds: [2, 99, 2] });
        expect(Object.keys(previews)).toEqual(['2']);
        expect(previews[2]).toHaveLength(1);
    });

    it('returns nothing for no posts without touching the repository', async () => {
        await expect((await setup()).execute({ postIds: [] })).resolves.toEqual({});
    });

    it.each([0, -1, 1.5])('rejects post id %s', async (id) => {
        await expect((await setup()).execute({ postIds: [1, id] })).rejects.toBeInstanceOf(InvalidIdError);
    });

    it.each([0, 2.5])('rejects limit %s', async (limit) => {
        await expect((await setup()).execute({ postIds: [1], limit })).rejects.toBeInstanceOf(RangeError);
    });
});
