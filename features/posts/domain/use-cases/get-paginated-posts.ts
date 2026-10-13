import { InvalidPageError, type Paginated } from '@/shared/domain/pagination';
import type { Post } from '../entities/post';
import { DEFAULT_POST_SORT, normalizeSearch, type PostQuery, type PostSort } from '../entities/post-query';
import type { PostRepository } from '../repositories/post-repository';

export const DEFAULT_PAGE_SIZE = 9;

export type GetPaginatedPostsInput = {
    page: number;
    pageSize?: number;
    search?: string;
    sort?: PostSort;
};

export type PaginatedPosts = Paginated<Post> & { query: PostQuery };

export class GetPaginatedPosts {
    constructor(private readonly posts: PostRepository) {}

    async execute({ page, pageSize = DEFAULT_PAGE_SIZE, search = '', sort = DEFAULT_POST_SORT }: GetPaginatedPostsInput): Promise<PaginatedPosts> {
        if (!Number.isInteger(page) || page < 1) throw new InvalidPageError(page);
        if (!Number.isInteger(pageSize) || pageSize < 1) throw new RangeError(`Invalid page size: ${pageSize}`);

        const query: PostQuery = { search: normalizeSearch(search), sort };
        const totalItems = await this.posts.count(query);
        const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
        if (page > totalPages) throw new InvalidPageError(page);

        const items = await this.posts.findPage(pageSize, (page - 1) * pageSize, query);
        return { items, page, pageSize, totalItems, totalPages, query };
    }
}
