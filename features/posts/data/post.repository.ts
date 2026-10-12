import { asc, desc, eq, like, or, type SQL } from 'drizzle-orm';
import { db } from '@/drizzle/src/db';
import { postTable } from '@/drizzle/src/db/schema';
import type { Post } from '../domain/entities/post';
import type { PostQuery } from '../domain/entities/post-query';
import type { PostRepository } from '../domain/repositories/post-repository';
import { toPost, toSearchPattern } from './post.mapper';

// Default collation is case-insensitive, so LIKE already ignores case
const matches = (query: PostQuery): SQL | undefined => {
    if (!query.search) return undefined;
    const pattern = toSearchPattern(query.search);
    return or(like(postTable.title, pattern), like(postTable.content, pattern));
};

// createdAt is an ISO string, so lexical order is chronological; id breaks ties
const orderFor = (query: PostQuery) =>
    query.sort === 'oldest'
        ? [asc(postTable.createdAt), asc(postTable.id)]
        : [desc(postTable.createdAt), desc(postTable.id)];

export class DrizzlePostRepository implements PostRepository {
    async findAll(): Promise<Post[]> {
        const rows = await db.select().from(postTable).orderBy(desc(postTable.createdAt));
        return rows.map(toPost);
    }

    async findPage(limit: number, offset: number, query: PostQuery): Promise<Post[]> {
        const rows = await db
            .select()
            .from(postTable)
            .where(matches(query))
            .orderBy(...orderFor(query))
            .limit(limit)
            .offset(offset);
        return rows.map(toPost);
    }

    count(query: PostQuery): Promise<number> {
        return db.$count(postTable, matches(query));
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
