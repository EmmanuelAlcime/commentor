import { assertValidId } from '@/shared/domain/errors';
import type { Post } from '../entities/post';
import { PostNotFoundError } from '../errors';
import type { PostRepository } from '../repositories/post-repository';

export class GetPostById {
    constructor(private readonly posts: PostRepository) {}

    async execute(id: number): Promise<Post> {
        assertValidId(id);
        const post = await this.posts.findById(id);
        if (!post) {
            throw new PostNotFoundError(id);
        }
        return post;
    }
}
