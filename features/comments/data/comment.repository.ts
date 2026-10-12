import { desc, eq } from 'drizzle-orm';
import { db } from '@/drizzle/src/db';
import { commentsTable } from '@/drizzle/src/db/schema';
import type { Comment } from '../domain/entities/comment';
import type { CommentRepository } from '../domain/repositories/comment-repository';
import { toComment } from './comment.mapper';

export class DrizzleCommentRepository implements CommentRepository {
    async findById(id: number): Promise<Comment | null> {
        const [row] = await db.select().from(commentsTable).where(eq(commentsTable.id, id)).limit(1);
        return row ? toComment(row) : null;
    }

    async findByPostId(postId: number): Promise<Comment[]> {
        const rows = await db
            .select()
            .from(commentsTable)
            .where(eq(commentsTable.postId, postId))
            .orderBy(desc(commentsTable.createdAt));
        return rows.map(toComment);
    }

    async findByUserId(userId: number): Promise<Comment[]> {
        const rows = await db
            .select()
            .from(commentsTable)
            .where(eq(commentsTable.userId, userId))
            .orderBy(desc(commentsTable.createdAt));
        return rows.map(toComment);
    }
}
