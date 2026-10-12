import type { commentsTable } from '@/drizzle/src/db/schema';
import type { Comment, CommentHistoryItem, CommentView } from '../domain/entities/comment';

export type CommentRow = typeof commentsTable.$inferSelect;

// A comment row joined with both possible authors and its like counts
export type CommentViewRow = CommentRow & {
    // Better Auth user (registered author)
    authorName: string | null;
    authorImage: string | null;
    // Legacy `users` row (seeded author)
    legacyFirstName: string | null;
    legacyLastName: string | null;
    legacyUsername: string | null;
    likeCount: number;
    likedByViewer: boolean;
};

// A comment row joined with the post it was written on
export type CommentHistoryRow = CommentRow & {
    postTitle: string | null;
    postSlug: string | null;
    likeCount: number;
};

export const UNKNOWN_AUTHOR = 'Unknown user';

// createdAt is stored as an ISO string for compatibility with the seeded rows
export const toStoredDate = (date: Date) => date.toISOString();

export function toComment(row: CommentRow): Comment {
    return {
        id: row.id,
        postId: row.postId,
        parentId: row.parentId,
        userId: row.userId,
        authorId: row.authorId,
        content: row.content,
        createdAt: row.createdAt ? new Date(row.createdAt) : null,
        editedAt: row.editedAt,
    };
}

function authorName(row: CommentViewRow): string {
    if (row.authorName) return row.authorName;
    const legacyName = [row.legacyFirstName, row.legacyLastName].filter(Boolean).join(' ');
    return legacyName || row.legacyUsername || UNKNOWN_AUTHOR;
}

export function toCommentView(row: CommentViewRow): CommentView {
    return {
        ...toComment(row),
        authorName: authorName(row),
        authorImage: row.authorImage ?? null,
        likeCount: row.likeCount,
        likedByViewer: row.likedByViewer,
    };
}

export function toCommentHistoryItem(row: CommentHistoryRow): CommentHistoryItem {
    return {
        ...toComment(row),
        postTitle: row.postTitle,
        postSlug: row.postSlug,
        likeCount: row.likeCount,
    };
}
