import { describe, expect, it } from 'vitest';
import { PostNotFoundError } from '@/features/posts/domain/errors';
import { GetPostById } from '@/features/posts/domain/use-cases/get-post-by-id';
import { InvalidIdError } from '@/shared/domain/errors';
import { InMemoryPostRepository, makePost } from './fake-post-repository';

describe('GetPostById', () => {
    const useCase = new GetPostById(new InMemoryPostRepository([makePost({ id: 3 })]));

    it('returns the matching post', async () => {
        await expect(useCase.execute(3)).resolves.toMatchObject({ id: 3 });
    });

    it('throws PostNotFoundError when the post does not exist', async () => {
        await expect(useCase.execute(99)).rejects.toBeInstanceOf(PostNotFoundError);
    });

    it.each([0, -1, 2.5])('throws InvalidIdError for id %s', async (id) => {
        await expect(useCase.execute(id)).rejects.toBeInstanceOf(InvalidIdError);
    });
});
