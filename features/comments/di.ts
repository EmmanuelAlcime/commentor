import { DrizzleCommentRepository } from './data/comment.repository';
import { GetCommentById } from './domain/use-cases/get-comment-by-id';
import { GetPostComments } from './domain/use-cases/get-post-comments';
import { GetUserComments } from './domain/use-cases/get-user-comments';

const commentRepository = new DrizzleCommentRepository();

export const getCommentById = (id: number) => new GetCommentById(commentRepository).execute(id);
export const getPostComments = (postId: number) => new GetPostComments(commentRepository).execute(postId);
export const getUserComments = (userId: number) => new GetUserComments(commentRepository).execute(userId);
