import { and, count, eq } from 'drizzle-orm';
import { db } from '@/drizzle/src/db';
import { postLikeTable } from '@/drizzle/src/db/schema';
import type { PostLikeRepository } from '../domain/repositories/post-like-repository';

const byPostAndUser = (postId: number, userId: string) =>
    and(eq(postLikeTable.postId, postId), eq(postLikeTable.userId, userId));

export class DrizzlePostLikeRepository implements PostLikeRepository {
    async countByPostId(postId: number): Promise<number> {
        const [row] = await db.select({ value: count() }).from(postLikeTable).where(eq(postLikeTable.postId, postId));
        return row?.value ?? 0;
    }

    async isLikedBy(postId: number, userId: string): Promise<boolean> {
        const [row] = await db
            .select({ postId: postLikeTable.postId })
            .from(postLikeTable)
            .where(byPostAndUser(postId, userId))
            .limit(1);
        return row !== undefined;
    }

    async add(postId: number, userId: string): Promise<void> {
        // The (postId, userId) primary key makes a second like a no-op
        await db.insert(postLikeTable).ignore().values({ postId, userId });
    }

    async remove(postId: number, userId: string): Promise<void> {
        await db.delete(postLikeTable).where(byPostAndUser(postId, userId));
    }
}
