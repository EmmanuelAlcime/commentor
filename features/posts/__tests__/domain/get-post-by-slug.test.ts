import { describe, expect, it } from 'vitest';
import { PostNotFoundError } from '@/features/posts/domain/errors';
import { GetPostBySlug } from '@/features/posts/domain/use-cases/get-post-by-slug';
import { InMemoryPostRepository, makePost } from './fake-post-repository';

describe('GetPostBySlug', () => {
    const useCase = new GetPostBySlug(new InMemoryPostRepository([makePost({ slug: 'hello-world-1' })]));

    it('returns the matching post', async () => {
        await expect(useCase.execute('hello-world-1')).resolves.toMatchObject({ slug: 'hello-world-1' });
    });

    it('ignores surrounding whitespace', async () => {
        await expect(useCase.execute('  hello-world-1 ')).resolves.toMatchObject({ slug: 'hello-world-1' });
    });

    it('throws PostNotFoundError for an unknown slug', async () => {
        await expect(useCase.execute('missing')).rejects.toBeInstanceOf(PostNotFoundError);
    });

    it('throws PostNotFoundError for an empty slug', async () => {
        await expect(useCase.execute('   ')).rejects.toBeInstanceOf(PostNotFoundError);
    });
});
