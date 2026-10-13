import { DrizzleCommentRepository } from './data/comment.repository';
import { CreateComment, type CreateCommentInput } from './domain/use-cases/create-comment';
import { DeleteComment, type DeleteCommentInput } from './domain/use-cases/delete-comment';
import { EditComment, type EditCommentInput } from './domain/use-cases/edit-comment';
import { GetAuthorCommentHistory } from './domain/use-cases/get-author-comment-history';
import { GetCommentById } from './domain/use-cases/get-comment-by-id';
import { GetPostComments, type GetPostCommentsInput } from './domain/use-cases/get-post-comments';
import { GetTopCommentPreviews, type GetTopCommentPreviewsInput } from './domain/use-cases/get-top-comment-previews';
import { GetUserComments } from './domain/use-cases/get-user-comments';
import { LikeComment, type LikeCommentInput } from './domain/use-cases/like-comment';
import { ReplyToComment, type ReplyToCommentInput } from './domain/use-cases/reply-to-comment';
import { UnlikeComment, type UnlikeCommentInput } from './domain/use-cases/unlike-comment';

const commentRepository = new DrizzleCommentRepository();

export const getCommentById = (id: number) => new GetCommentById(commentRepository).execute(id);
export const getPostComments = (input: GetPostCommentsInput) => new GetPostComments(commentRepository).execute(input);
export const getTopCommentPreviews = (input: GetTopCommentPreviewsInput) => new GetTopCommentPreviews(commentRepository).execute(input);
export const getUserComments = (userId: number) => new GetUserComments(commentRepository).execute(userId);
export const getAuthorCommentHistory = (authorId: string) => new GetAuthorCommentHistory(commentRepository).execute(authorId);
export const createComment = (input: CreateCommentInput) => new CreateComment(commentRepository).execute(input);
export const replyToComment = (input: ReplyToCommentInput) => new ReplyToComment(commentRepository).execute(input);
export const editComment = (input: EditCommentInput) => new EditComment(commentRepository).execute(input);
export const deleteComment = (input: DeleteCommentInput) => new DeleteComment(commentRepository).execute(input);
export const likeComment = (input: LikeCommentInput) => new LikeComment(commentRepository).execute(input);
export const unlikeComment = (input: UnlikeCommentInput) => new UnlikeComment(commentRepository).execute(input);
