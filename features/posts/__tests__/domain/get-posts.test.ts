import { describe, expect, it } from 'vitest';
import { GetPosts } from '@/features/posts/domain/use-cases/get-posts';
import { InMemoryPostRepository, makePost } from './fake-post-repository';

describe('GetPosts', () => {
    it('returns every post', async () => {
        const posts = [makePost({ id: 1 }), makePost({ id: 2 })];
        const result = await new GetPosts(new InMemoryPostRepository(posts)).execute();
        expect(result).toEqual(posts);
    });

    it('returns an empty list when there are no posts', async () => {
        const result = await new GetPosts(new InMemoryPostRepository()).execute();
        expect(result).toEqual([]);
    });
});
