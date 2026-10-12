import type { postTable } from '@/drizzle/src/db/schema';
import type { Post } from '../domain/entities/post';

export type PostRow = typeof postTable.$inferSelect;

export function toPost(row: PostRow): Post {
    return {
        id: row.id,
        title: row.title,
        content: row.content,
        slug: row.slug,
        image: row.image,
        date: row.date,
        createdAt: row.createdAt ? new Date(row.createdAt) : null,
    };
}

// LIKE pattern for a "contains" search; `%`, `_` and `\` typed by the user are matched literally
export function toSearchPattern(search: string): string {
    return `%${search.replace(/[\\%_]/g, '\\$&')}%`;
}
