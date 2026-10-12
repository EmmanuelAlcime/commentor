import { and, desc, eq, getColumns, inArray, sql } from 'drizzle-orm';
import { db } from '@/drizzle/src/db';
import { commentLikeTable, commentsTable, postTable, user, userTable } from '@/drizzle/src/db/schema';
import type { Comment, CommentView } from '../domain/entities/comment';
import type { CommentRepository, NewComment } from '../domain/repositories/comment-repository';
import { toComment, toCommentView, toStoredDate } from './comment.mapper';

const likeCount = sql<number>`(select count(*) from ${commentLikeTable} where ${commentLikeTable.commentId} = ${commentsTable.id})`.mapWith(Number);

const likedBy = (viewerId: string | null) =>
    viewerId
        ? sql<boolean>`exists(select 1 from ${commentLikeTable} where ${commentLikeTable.commentId} = ${commentsTable.id} and ${commentLikeTable.userId} = ${viewerId})`.mapWith(
              (value) => Number(value) === 1,
          )
        : sql<boolean>`false`.mapWith(() => false);

export class DrizzleCommentRepository implements CommentRepository {
    async findById(id: number): Promise<Comment | null> {
        const [row] = await db.select().from(commentsTable).where(eq(commentsTable.id, id)).limit(1);
        return row ? toComment(row) : null;
    }

    async findByUserId(userId: number): Promise<Comment[]> {
        const rows = await db
            .select()
            .from(commentsTable)
            .where(eq(commentsTable.userId, userId))
            .orderBy(desc(commentsTable.createdAt));
        return rows.map(toComment);
    }

    async findViewsByPostId(postId: number, viewerId: string | null): Promise<CommentView[]> {
        const rows = await db
            .select({
                ...getColumns(commentsTable),
                authorName: user.name,
                legacyFirstName: userTable.firstName,
                legacyLastName: userTable.lastName,
                legacyUsername: userTable.username,
                likeCount,
                likedByViewer: likedBy(viewerId),
            })
            .from(commentsTable)
            .leftJoin(user, eq(user.id, commentsTable.authorId))
            .leftJoin(userTable, eq(userTable.id, commentsTable.userId))
            .where(eq(commentsTable.postId, postId));
        return rows.map(toCommentView);
    }

    async postExists(postId: number): Promise<boolean> {
        const [row] = await db.select({ id: postTable.id }).from(postTable).where(eq(postTable.id, postId)).limit(1);
        return row !== undefined;
    }

    async create(comment: NewComment): Promise<Comment> {
        const [{ id }] = await db
            .insert(commentsTable)
            .values({ ...comment, createdAt: toStoredDate(comment.createdAt) })
            .$returningId();
        return { ...comment, id, userId: null, editedAt: null };
    }

    async updateContent(id: number, content: string, editedAt: Date): Promise<void> {
        await db.update(commentsTable).set({ content, editedAt }).where(eq(commentsTable.id, id));
    }

    async deleteThread(id: number): Promise<void> {
        await db.transaction(async (tx) => {
            // Walk down the thread one level at a time; works on any MySQL version and at any depth
            const doomed = [id];
            let frontier = [id];
            while (frontier.length > 0) {
                const children = await tx
                    .select({ id: commentsTable.id })
                    .from(commentsTable)
                    .where(inArray(commentsTable.parentId, frontier));
                frontier = children.map((child) => child.id);
                doomed.push(...frontier);
            }
            // Likes on these comments go with them through the comment_like foreign key
            await tx.delete(commentsTable).where(inArray(commentsTable.id, doomed));
        });
    }

    async addLike(commentId: number, userId: string): Promise<void> {
        await db.insert(commentLikeTable).ignore().values({ commentId, userId });
    }

    async removeLike(commentId: number, userId: string): Promise<void> {
        await db
            .delete(commentLikeTable)
            .where(and(eq(commentLikeTable.commentId, commentId), eq(commentLikeTable.userId, userId)));
    }
}
