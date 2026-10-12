import { describe, expect, it } from 'vitest';
import { CommentNotFoundError } from '@/features/comments/domain/errors';
import { GetCommentById } from '@/features/comments/domain/use-cases/get-comment-by-id';
import { InvalidIdError } from '@/shared/domain/errors';
import { InMemoryCommentRepository, makeComment } from './fake-comment-repository';

describe('GetCommentById', () => {
    const useCase = new GetCommentById(new InMemoryCommentRepository([makeComment({ id: 5 })]));

    it('returns the matching comment', async () => {
        await expect(useCase.execute(5)).resolves.toMatchObject({ id: 5 });
    });

    it('throws CommentNotFoundError when the comment does not exist', async () => {
        await expect(useCase.execute(99)).rejects.toBeInstanceOf(CommentNotFoundError);
    });

    it('throws InvalidIdError for an invalid id', async () => {
        await expect(useCase.execute(0)).rejects.toBeInstanceOf(InvalidIdError);
    });
});
