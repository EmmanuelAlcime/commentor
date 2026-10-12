import type { Post } from '@/features/posts/domain/entities/post';
import type { PostRepository } from '@/features/posts/domain/repositories/post-repository';

export class InMemoryPostRepository implements PostRepository {
    constructor(private readonly posts: Post[] = []) {}

    async findAll(): Promise<Post[]> {
        return [...this.posts];
    }

    async findPage(limit: number, offset: number): Promise<Post[]> {
        return this.posts.slice(offset, offset + limit);
    }

    async count(): Promise<number> {
        return this.posts.length;
    }

    async findById(id: number): Promise<Post | null> {
        return this.posts.find((post) => post.id === id) ?? null;
    }

    async findBySlug(slug: string): Promise<Post | null> {
        return this.posts.find((post) => post.slug === slug) ?? null;
    }
}

export const makePost = (overrides: Partial<Post> = {}): Post => ({
    id: 1,
    title: 'Hello World',
    content: 'First post',
    slug: 'hello-world-1',
    image: null,
    date: '2026-01-01',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
});
