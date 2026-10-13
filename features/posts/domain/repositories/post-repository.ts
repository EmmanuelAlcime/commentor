import type { Post } from '../entities/post';
import type { PostQuery } from '../entities/post-query';

export interface PostRepository {
    findAll(): Promise<Post[]>;
    // A page of posts matching the query (search in title or content), in the query's order
    findPage(limit: number, offset: number, query: PostQuery): Promise<Post[]>;
    count(query: PostQuery): Promise<number>;
    findById(id: number): Promise<Post | null>;
    findBySlug(slug: string): Promise<Post | null>;
}
