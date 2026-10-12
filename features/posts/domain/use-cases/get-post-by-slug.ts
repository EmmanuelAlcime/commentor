import type { Post } from '../entities/post';
import { PostNotFoundError } from '../errors';
import type { PostRepository } from '../repositories/post-repository';

export class GetPostBySlug {
    constructor(private readonly posts: PostRepository) {}

    async execute(slug: string): Promise<Post> {
        const trimmed = slug.trim();
        const post = trimmed ? await this.posts.findBySlug(trimmed) : null;
        if (!post) {
            throw new PostNotFoundError(slug);
        }
        return post;
    }
}
