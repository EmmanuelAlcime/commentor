export const POST_SORTS = ['newest', 'oldest'] as const;
export type PostSort = (typeof POST_SORTS)[number];
export const DEFAULT_POST_SORT: PostSort = 'newest';

export const SEARCH_MAX_LENGTH = 100;

// How the post list is filtered and ordered; an empty search means every post
export type PostQuery = {
    search: string;
    sort: PostSort;
};

export const DEFAULT_POST_QUERY: PostQuery = { search: '', sort: DEFAULT_POST_SORT };

// Trims, collapses inner whitespace and caps the length so a pasted novel cannot become a query
export function normalizeSearch(value: string): string {
    return value.trim().replace(/\s+/g, ' ').slice(0, SEARCH_MAX_LENGTH).trim();
}

export const isPostSort = (value: unknown): value is PostSort => POST_SORTS.some((sort) => sort === value);
