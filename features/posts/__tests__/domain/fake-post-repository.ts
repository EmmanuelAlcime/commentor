import type { Post } from '@/features/posts/domain/entities/post';
import { DEFAULT_POST_QUERY, type PostQuery } from '@/features/posts/domain/entities/post-query';
import type { PostRepository } from '@/features/posts/domain/repositories/post-repository';

export class InMemoryPostRepository implements PostRepository {
    constructor(private readonly posts: Post[] = []) {}

    async findAll(): Promise<Post[]> {
        return [...this.posts];
    }

    private matching(query: PostQuery): Post[] {
        const needle = query.search.toLowerCase();
        const time = (post: Post) => post.createdAt?.getTime() ?? 0;
        return this.posts
            .filter((post) => !needle || `${post.title ?? ''} ${post.content ?? ''}`.toLowerCase().includes(needle))
            .sort((a, b) => (query.sort === 'oldest' ? time(a) - time(b) || a.id - b.id : time(b) - time(a) || b.id - a.id));
    }

    async findPage(limit: number, offset: number, query: PostQuery = DEFAULT_POST_QUERY): Promise<Post[]> {
        return this.matching(query).slice(offset, offset + limit);
    }

    async count(query: PostQuery = DEFAULT_POST_QUERY): Promise<number> {
        return this.matching(query).length;
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
