import type { Post } from '../entities/post';
import type { PostRepository } from '../repositories/post-repository';

export class GetPosts {
    constructor(private readonly posts: PostRepository) {}

    execute(): Promise<Post[]> {
        return this.posts.findAll();
    }
}
