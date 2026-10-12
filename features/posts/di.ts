import { DrizzlePostLikeRepository } from './data/post-like.repository';
import { DrizzlePostRepository } from './data/post.repository';
import { GetPostById } from './domain/use-cases/get-post-by-id';
import { GetPostBySlug } from './domain/use-cases/get-post-by-slug';
import { GetPostLikes } from './domain/use-cases/get-post-likes';
import { GetPaginatedPosts } from './domain/use-cases/get-paginated-posts';
import { GetPosts } from './domain/use-cases/get-posts';
import { LikePost, type LikePostInput } from './domain/use-cases/like-post';
import { UnlikePost, type UnlikePostInput } from './domain/use-cases/unlike-post';

const postRepository = new DrizzlePostRepository();
const postLikeRepository = new DrizzlePostLikeRepository();

export const getPosts = () => new GetPosts(postRepository).execute();
export const getPaginatedPosts = (page: number) => new GetPaginatedPosts(postRepository).execute(page);
export const getPostById = (id: number) => new GetPostById(postRepository).execute(id);
export const getPostBySlug = (slug: string) => new GetPostBySlug(postRepository).execute(slug);
export const getPostLikes = (postId: number, viewerId: string | null) => new GetPostLikes(postLikeRepository).execute(postId, viewerId);
export const likePost = (input: LikePostInput) => new LikePost(postRepository, postLikeRepository).execute(input);
export const unlikePost = (input: UnlikePostInput) => new UnlikePost(postLikeRepository).execute(input);
