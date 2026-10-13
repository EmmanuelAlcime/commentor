import type { commentsTable } from '@/drizzle/src/db/schema';
import type { Comment, CommentHistoryItem, CommentPreview, CommentView } from '../domain/entities/comment';

export type CommentRow = typeof commentsTable.$inferSelect;

// Both possible authors of a comment, joined onto its row
export type AuthorColumns = {
    // Better Auth user (registered author)
    authorName: string | null;
    authorImage: string | null;
    // Legacy `users` row (seeded author)
    legacyFirstName: string | null;
    legacyLastName: string | null;
    legacyUsername: string | null;
};

// A comment row joined with both possible authors and its like counts
export type CommentViewRow = CommentRow &
    AuthorColumns & {
        likeCount: number;
        likedByViewer: boolean;
    };

// A comment row joined with its authors and like count, as selected for post card previews
export type CommentPreviewRow = CommentRow & AuthorColumns & { likeCount: number };

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

function authorName(row: AuthorColumns): string {
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

// Previews of a seeded comment have no post to point at only when postId is null, which the query excludes
export function toCommentPreview(row: CommentPreviewRow): CommentPreview {
    return {
        id: row.id,
        postId: row.postId ?? 0,
        content: row.content,
        authorName: authorName(row),
        authorImage: row.authorImage ?? null,
        // Comes back through a subquery, where the driver may hand it over as a string
        likeCount: Number(row.likeCount),
        createdAt: row.createdAt ? new Date(row.createdAt) : null,
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
