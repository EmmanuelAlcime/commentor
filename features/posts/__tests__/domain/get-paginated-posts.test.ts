import { describe, expect, it } from 'vitest';
import { InvalidPageError } from '@/shared/domain/pagination';
import { GetPaginatedPosts } from '@/features/posts/domain/use-cases/get-paginated-posts';
import { InMemoryPostRepository, makePost } from './fake-post-repository';

const makePosts = (count: number) => Array.from({ length: count }, (_, i) => makePost({ id: i + 1, slug: `post-${i + 1}` }));

describe('GetPaginatedPosts', () => {
    it('returns the first page with totals', async () => {
        const posts = makePosts(5);
        const result = await new GetPaginatedPosts(new InMemoryPostRepository(posts)).execute(1, 2);
        expect(result).toEqual({ items: posts.slice(0, 2), page: 1, pageSize: 2, totalItems: 5, totalPages: 3 });
    });

    it('returns a partial last page', async () => {
        const posts = makePosts(5);
        const result = await new GetPaginatedPosts(new InMemoryPostRepository(posts)).execute(3, 2);
        expect(result.items).toEqual(posts.slice(4));
    });

    it('returns an empty first page when there are no posts', async () => {
        const result = await new GetPaginatedPosts(new InMemoryPostRepository()).execute(1, 2);
        expect(result).toEqual({ items: [], page: 1, pageSize: 2, totalItems: 0, totalPages: 1 });
    });

    it.each([0, -1, 1.5, Number.NaN])('throws InvalidPageError for page %s', async (page) => {
        await expect(new GetPaginatedPosts(new InMemoryPostRepository(makePosts(3))).execute(page, 2)).rejects.toBeInstanceOf(InvalidPageError);
    });

    it('throws InvalidPageError past the last page', async () => {
        await expect(new GetPaginatedPosts(new InMemoryPostRepository(makePosts(3))).execute(3, 2)).rejects.toBeInstanceOf(InvalidPageError);
    });

    it('rejects an invalid page size', async () => {
        await expect(new GetPaginatedPosts(new InMemoryPostRepository()).execute(1, 0)).rejects.toBeInstanceOf(RangeError);
    });
});
