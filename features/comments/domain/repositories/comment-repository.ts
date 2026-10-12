import type { Comment, CommentHistoryItem, CommentView } from '../entities/comment';

export type NewComment = {
    postId: number;
    parentId: number | null;
    authorId: string;
    content: string;
    createdAt: Date;
};

export interface CommentRepository {
    findById(id: number): Promise<Comment | null>;
    findByUserId(userId: number): Promise<Comment[]>;
    // Everything a registered user has written, newest first, with the post each comment belongs to
    findHistoryByAuthorId(authorId: string): Promise<CommentHistoryItem[]>;
    // Every comment and reply on the post, flat, with author name and likes as seen by the viewer
    findViewsByPostId(postId: number, viewerId: string | null): Promise<CommentView[]>;
    postExists(postId: number): Promise<boolean>;
    create(comment: NewComment): Promise<Comment>;
    updateContent(id: number, content: string, editedAt: Date): Promise<void>;
    // Deletes the comment and all of its replies at any depth
    deleteThread(id: number): Promise<void>;
    // Both are idempotent: liking twice keeps one like, unliking without a like does nothing
    addLike(commentId: number, userId: string): Promise<void>;
    removeLike(commentId: number, userId: string): Promise<void>;
}
