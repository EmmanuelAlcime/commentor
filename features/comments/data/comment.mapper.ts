import type { commentsTable } from '@/drizzle/src/db/schema';
import type { Comment } from '../domain/entities/comment';

export type CommentRow = typeof commentsTable.$inferSelect;

export function toComment(row: CommentRow): Comment {
    return {
        id: row.id,
        postId: row.postId,
        userId: row.userId,
        content: row.content,
        createdAt: row.createdAt ? new Date(row.createdAt) : null,
    };
}
