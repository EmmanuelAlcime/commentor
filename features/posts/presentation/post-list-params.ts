import { DEFAULT_POST_SORT, isPostSort, type PostSort } from '@/features/posts/domain/entities/post-query';

type SearchParams = Record<string, string | string[] | undefined>;

export type PostListParams = {
    page: number;
    search: string;
    sort: PostSort;
};

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

// Reads ?page=, ?q= and ?sort= from the URL. A missing page is 1; a malformed one is passed through
// so the use case can reject it and the page can 404, matching how it behaved before search existed.
export function parsePostListParams(searchParams: SearchParams): PostListParams {
    const page = first(searchParams.page);
    const sort = first(searchParams.sort);
    return {
        page: typeof page === 'string' ? Number(page) : 1,
        search: first(searchParams.q) ?? '',
        sort: isPostSort(sort) ? sort : DEFAULT_POST_SORT,
    };
}

// Builds a home URL that keeps the current search and sort; defaults are left out so "/" stays canonical
export function postListHref({ page, search, sort }: Partial<PostListParams>): string {
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (sort && sort !== DEFAULT_POST_SORT) params.set('sort', sort);
    if (page && page > 1) params.set('page', String(page));
    const query = params.toString();
    return query ? `/?${query}` : '/';
}
