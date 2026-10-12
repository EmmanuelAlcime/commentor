import { InvalidPageError, type Paginated } from '@/shared/domain/pagination';
import type { Post } from '../entities/post';
import type { PostRepository } from '../repositories/post-repository';

export const DEFAULT_PAGE_SIZE = 9;

export class GetPaginatedPosts {
    constructor(private readonly posts: PostRepository) {}

    async execute(page: number, pageSize: number = DEFAULT_PAGE_SIZE): Promise<Paginated<Post>> {
        if (!Number.isInteger(page) || page < 1) throw new InvalidPageError(page);
        if (!Number.isInteger(pageSize) || pageSize < 1) throw new RangeError(`Invalid page size: ${pageSize}`);

        const totalItems = await this.posts.count();
        const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
        if (page > totalPages) throw new InvalidPageError(page);

        const items = await this.posts.findPage(pageSize, (page - 1) * pageSize);
        return { items, page, pageSize, totalItems, totalPages };
    }
}
