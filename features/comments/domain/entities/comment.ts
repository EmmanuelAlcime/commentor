import { InvalidCommentContentError } from '../errors';

export const COMMENT_MAX_LENGTH = 2000;

export type Comment = {
    id: number;
    postId: number | null;
    // null for a top-level comment, otherwise the comment being replied to (at any depth)
    parentId: number | null;
    // Legacy seeded author (`users` table); registered users are identified by authorId instead
    userId: number | null;
    // Better Auth user id; null for seeded comments
    authorId: string | null;
    content: string | null;
    createdAt: Date | null;
    editedAt: Date | null;
};

// A comment as shown to a particular viewer
export type CommentView = Comment & {
    authorName: string;
    likeCount: number;
    likedByViewer: boolean;
};

export const COMMENT_SORTS = ['newest', 'top'] as const;
export type CommentSort = (typeof COMMENT_SORTS)[number];

export const isCommentAuthor = (comment: Pick<Comment, 'authorId'>, userId: string): boolean =>
    comment.authorId !== null && comment.authorId === userId;

// Returns the content to store, or throws if it is empty or too long once trimmed
export function validateCommentContent(content: string): string {
    const trimmed = content.trim();
    if (!trimmed) {
        throw new InvalidCommentContentError('empty');
    }
    if (trimmed.length > COMMENT_MAX_LENGTH) {
        throw new InvalidCommentContentError('too-long');
    }
    return trimmed;
}
