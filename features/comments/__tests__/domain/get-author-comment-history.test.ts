import { describe, expect, it } from 'vitest';
import { InvalidAuthorIdError } from '@/features/comments/domain/errors';
import { GetAuthorCommentHistory } from '@/features/comments/domain/use-cases/get-author-comment-history';
import { InMemoryCommentRepository, makeComment } from './fake-comment-repository';

const at = (iso: string) => new Date(iso);

describe('GetAuthorCommentHistory', () => {
    const repository = new InMemoryCommentRepository(
        [
            makeComment({ id: 1, postId: 1, authorId: 'user-1', userId: null, createdAt: at('2026-01-01T00:00:00Z') }),
            makeComment({ id: 2, postId: 2, authorId: 'user-2', userId: null, createdAt: at('2026-01-02T00:00:00Z') }),
            makeComment({ id: 3, postId: 2, parentId: 2, authorId: 'user-1', userId: null, createdAt: at('2026-01-03T00:00:00Z') }),
            makeComment({ id: 4, postId: 99, authorId: 'user-1', userId: null, createdAt: at('2026-01-03T00:00:00Z') }),
        ],
        { posts: [{ id: 1, title: 'First', slug: 'first' }, { id: 2, title: 'Second', slug: 'second' }] },
    );
    const useCase = new GetAuthorCommentHistory(repository);

    it('returns only the author’s comments and replies, newest first', async () => {
        const history = await useCase.execute('user-1');
        expect(history.map((item) => item.id)).toEqual([4, 3, 1]);
    });

    it('attaches the post each comment belongs to', async () => {
        const history = await useCase.execute('user-1');
        expect(history.find((item) => item.id === 3)).toMatchObject({ postTitle: 'Second', postSlug: 'second', parentId: 2 });
    });

    it('leaves the post empty when it no longer exists', async () => {
        const history = await useCase.execute('user-1');
        expect(history.find((item) => item.id === 4)).toMatchObject({ postTitle: null, postSlug: null });
    });

    it('includes like counts', async () => {
        await repository.addLike(1, 'user-2');
        await repository.addLike(1, 'user-3');
        const history = await useCase.execute('user-1');
        expect(history.find((item) => item.id === 1)?.likeCount).toBe(2);
    });

    it('returns an empty list for an author with no comments', async () => {
        await expect(useCase.execute('nobody')).resolves.toEqual([]);
    });

    it.each(['', '   '])('throws InvalidAuthorIdError for author id %j', async (authorId) => {
        await expect(useCase.execute(authorId)).rejects.toBeInstanceOf(InvalidAuthorIdError);
    });
});
