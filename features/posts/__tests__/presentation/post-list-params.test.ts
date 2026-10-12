import { describe, expect, it } from 'vitest';
import { parsePostListParams, postListHref } from '@/features/posts/presentation/post-list-params';

describe('parsePostListParams', () => {
    it('defaults to page 1, no search, newest first', () => {
        expect(parsePostListParams({})).toEqual({ page: 1, search: '', sort: 'newest' });
    });

    it('reads page, q and sort', () => {
        expect(parsePostListParams({ page: '3', q: 'react', sort: 'oldest' })).toEqual({ page: 3, search: 'react', sort: 'oldest' });
    });

    it('takes the first value when a param repeats', () => {
        expect(parsePostListParams({ q: ['a', 'b'], sort: ['oldest', 'newest'], page: ['2', '9'] })).toEqual({
            page: 2,
            search: 'a',
            sort: 'oldest',
        });
    });

    it('falls back to newest for an unknown sort', () => {
        expect(parsePostListParams({ sort: 'top' }).sort).toBe('newest');
    });

    it('passes a malformed page through as NaN so the page can 404', () => {
        expect(parsePostListParams({ page: 'abc' }).page).toBeNaN();
    });
});

describe('postListHref', () => {
    it('is the bare home URL for defaults', () => {
        expect(postListHref({})).toBe('/');
        expect(postListHref({ page: 1, search: '', sort: 'newest' })).toBe('/');
    });

    it('keeps search and sort and adds the page', () => {
        expect(postListHref({ page: 2, search: 'react hooks', sort: 'oldest' })).toBe('/?q=react+hooks&sort=oldest&page=2');
    });

    it('omits whichever parts are default', () => {
        expect(postListHref({ page: 2 })).toBe('/?page=2');
        expect(postListHref({ search: 'x' })).toBe('/?q=x');
        expect(postListHref({ sort: 'oldest' })).toBe('/?sort=oldest');
    });
});
