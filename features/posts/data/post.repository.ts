import { desc, eq } from 'drizzle-orm';
import { db } from '@/drizzle/src/db';
import { postTable } from '@/drizzle/src/db/schema';
import type { Post } from '../domain/entities/post';
import type { PostRepository } from '../domain/repositories/post-repository';
import { toPost } from './post.mapper';

export class DrizzlePostRepository implements PostRepository {
    async findAll(): Promise<Post[]> {
        const rows = await db.select().from(postTable).orderBy(desc(postTable.createdAt));
        return rows.map(toPost);
    }

    async findPage(limit: number, offset: number): Promise<Post[]> {
        const rows = await db
            .select()
            .from(postTable)
            .orderBy(desc(postTable.createdAt), desc(postTable.id))
            .limit(limit)
            .offset(offset);
        return rows.map(toPost);
    }

    count(): Promise<number> {
        return db.$count(postTable);
    }

    async findById(id: number): Promise<Post | null> {
        const [row] = await db.select().from(postTable).where(eq(postTable.id, id)).limit(1);
        return row ? toPost(row) : null;
    }

    async findBySlug(slug: string): Promise<Post | null> {
        const [row] = await db.select().from(postTable).where(eq(postTable.slug, slug)).limit(1);
        return row ? toPost(row) : null;
    }
}
