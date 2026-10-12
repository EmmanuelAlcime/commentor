import { describe, expect, it } from 'vitest';
import { GetPostComments } from '@/features/comments/domain/use-cases/get-post-comments';
import { InvalidIdError } from '@/shared/domain/errors';
import { InMemoryCommentRepository, makeComment } from './fake-comment-repository';

describe('GetPostComments', () => {
    const useCase = new GetPostComments(
        new InMemoryCommentRepository([
            makeComment({ id: 1, postId: 1 }),
            makeComment({ id: 2, postId: 2 }),
            makeComment({ id: 3, postId: 1 }),
        ]),
    );

    it('returns only the comments for the given post', async () => {
        const result = await useCase.execute(1);
        expect(result.map((comment) => comment.id)).toEqual([1, 3]);
    });

    it('returns an empty list for a post with no comments', async () => {
        await expect(useCase.execute(42)).resolves.toEqual([]);
    });

    it('throws InvalidIdError for an invalid post id', async () => {
        await expect(useCase.execute(-1)).rejects.toBeInstanceOf(InvalidIdError);
    });
});
