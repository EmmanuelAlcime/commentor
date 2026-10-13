import { describe, expect, it } from 'vitest';
import { InvalidPageError } from '@/shared/domain/pagination';
import { GetPaginatedPosts } from '@/features/posts/domain/use-cases/get-paginated-posts';
import { InMemoryPostRepository, makePost } from './fake-post-repository';

// Post i was created on day i, so "newest" is descending id and "oldest" ascending
const makePosts = (count: number) =>
    Array.from({ length: count }, (_, i) =>
        makePost({ id: i + 1, slug: `post-${i + 1}`, title: `Post ${i + 1}`, createdAt: new Date(Date.UTC(2026, 0, i + 1)) }),
    );
const ids = (result: { items: { id: number }[] }) => result.items.map((post) => post.id);

describe('GetPaginatedPosts', () => {
    it('returns the first page newest first with totals and the normalized query', async () => {
        const result = await new GetPaginatedPosts(new InMemoryPostRepository(makePosts(5))).execute({ page: 1, pageSize: 2 });

        expect(ids(result)).toEqual([5, 4]);
        expect(result).toMatchObject({ page: 1, pageSize: 2, totalItems: 5, totalPages: 3, query: { search: '', sort: 'newest' } });
    });

    it('returns a partial last page', async () => {
        const result = await new GetPaginatedPosts(new InMemoryPostRepository(makePosts(5))).execute({ page: 3, pageSize: 2 });
        expect(ids(result)).toEqual([1]);
    });

    it('sorts oldest first when asked', async () => {
        const result = await new GetPaginatedPosts(new InMemoryPostRepository(makePosts(5))).execute({ page: 1, pageSize: 2, sort: 'oldest' });

        expect(ids(result)).toEqual([1, 2]);
        expect(result.query.sort).toBe('oldest');
    });

    it('filters by a search term in the title or content, ignoring case', async () => {
        const posts = [
            makePost({ id: 1, title: 'Testing React', content: 'x', createdAt: new Date('2026-01-01') }),
            makePost({ id: 2, title: 'Cooking', content: 'A react-ion to heat', createdAt: new Date('2026-01-02') }),
            makePost({ id: 3, title: 'Gardening', content: 'Soil', createdAt: new Date('2026-01-03') }),
        ];
        const result = await new GetPaginatedPosts(new InMemoryPostRepository(posts)).execute({ page: 1, search: 'REACT' });

        expect(ids(result)).toEqual([2, 1]);
        expect(result).toMatchObject({ totalItems: 2, totalPages: 1, query: { search: 'REACT' } });
    });

    it('normalizes the search before using it', async () => {
        const result = await new GetPaginatedPosts(new InMemoryPostRepository(makePosts(2))).execute({ page: 1, search: '  Post   2 ' });

        expect(result.query.search).toBe('Post 2');
        expect(ids(result)).toEqual([2]);
    });

    it('returns an empty first page when nothing matches', async () => {
        const result = await new GetPaginatedPosts(new InMemoryPostRepository(makePosts(3))).execute({ page: 1, search: 'zzz' });
        expect(result).toMatchObject({ items: [], totalItems: 0, totalPages: 1 });
    });

    it('returns an empty first page when there are no posts', async () => {
        const result = await new GetPaginatedPosts(new InMemoryPostRepository()).execute({ page: 1, pageSize: 2 });
        expect(result).toMatchObject({ items: [], page: 1, pageSize: 2, totalItems: 0, totalPages: 1 });
    });

    it.each([0, -1, 1.5, Number.NaN])('throws InvalidPageError for page %s', async (page) => {
        await expect(new GetPaginatedPosts(new InMemoryPostRepository(makePosts(3))).execute({ page, pageSize: 2 })).rejects.toBeInstanceOf(
            InvalidPageError,
        );
    });

    it('throws InvalidPageError past the last page, counting only matching posts', async () => {
        const useCase = new GetPaginatedPosts(new InMemoryPostRepository(makePosts(3)));

        await expect(useCase.execute({ page: 3, pageSize: 2 })).rejects.toBeInstanceOf(InvalidPageError);
        await expect(useCase.execute({ page: 2, pageSize: 2, search: 'Post 1' })).rejects.toBeInstanceOf(InvalidPageError);
    });

    it('rejects an invalid page size', async () => {
        await expect(new GetPaginatedPosts(new InMemoryPostRepository()).execute({ page: 1, pageSize: 0 })).rejects.toBeInstanceOf(RangeError);
    });
});
