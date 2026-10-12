import type { Post } from '../entities/post';

export interface PostRepository {
    findAll(): Promise<Post[]>;
    findPage(limit: number, offset: number): Promise<Post[]>;
    count(): Promise<number>;
    findById(id: number): Promise<Post | null>;
    findBySlug(slug: string): Promise<Post | null>;
}
