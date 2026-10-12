import { describe, expect, it } from 'vitest';
import { GetUserComments } from '@/features/comments/domain/use-cases/get-user-comments';
import { InvalidIdError } from '@/shared/domain/errors';
import { InMemoryCommentRepository, makeComment } from './fake-comment-repository';

describe('GetUserComments', () => {
    const useCase = new GetUserComments(
        new InMemoryCommentRepository([
            makeComment({ id: 1, userId: 4 }),
            makeComment({ id: 2, userId: 5 }),
        ]),
    );

    it('returns only the comments written by the given user', async () => {
        const result = await useCase.execute(4);
        expect(result.map((comment) => comment.id)).toEqual([1]);
    });

    it('returns an empty list for a user with no comments', async () => {
        await expect(useCase.execute(42)).resolves.toEqual([]);
    });

    it('throws InvalidIdError for an invalid user id', async () => {
        await expect(useCase.execute(1.5)).rejects.toBeInstanceOf(InvalidIdError);
    });
});
