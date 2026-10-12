import { DrizzlePostRepository } from './data/post.repository';
import { GetPostById } from './domain/use-cases/get-post-by-id';
import { GetPostBySlug } from './domain/use-cases/get-post-by-slug';
import { GetPaginatedPosts } from './domain/use-cases/get-paginated-posts';
import { GetPosts } from './domain/use-cases/get-posts';

const postRepository = new DrizzlePostRepository();

export const getPosts = () => new GetPosts(postRepository).execute();
export const getPaginatedPosts = (page: number) => new GetPaginatedPosts(postRepository).execute(page);
export const getPostById = (id: number) => new GetPostById(postRepository).execute(id);
export const getPostBySlug = (slug: string) => new GetPostBySlug(postRepository).execute(slug);
