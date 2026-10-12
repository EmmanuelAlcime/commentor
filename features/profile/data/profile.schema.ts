import { mediumblob, mysqlTable, timestamp, varchar } from 'drizzle-orm/mysql-core';
// Relative path so drizzle-kit can resolve it without the @/ alias
import { user } from '../../auth/data/auth.schema';

// Profile pictures live in the database so uploads work without a file system or object store.
// `user.image` holds the URL that serves this row.
export const profileImageTable = mysqlTable('profile_image', {
    userId: varchar('user_id', { length: 36 })
        .primaryKey()
        .references(() => user.id, { onDelete: 'cascade' }),
    contentType: varchar('content_type', { length: 64 }).notNull(),
    // Up to 16 MB; uploads are capped well below that in the domain
    data: mediumblob('data', { mode: 'buffer' }).notNull(),
    updatedAt: timestamp('updated_at', { fsp: 3 }).defaultNow().notNull(),
});
