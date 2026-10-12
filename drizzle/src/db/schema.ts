import { index, int, mysqlTable, primaryKey, timestamp, varchar } from 'drizzle-orm/mysql-core'
// Relative path so drizzle-kit can resolve it without the @/ alias
import { user } from '../../../features/auth/data/auth.schema'


export const userTable = mysqlTable('users',{
    id: int('id').primaryKey(),
    username: varchar('username', { length: 255 }),
    password: varchar('password', { length: 255 }),
    firstName: varchar('firstName', { length: 255 }),
    lastName: varchar('lastName', { length: 255 }),
    email: varchar('email', { length: 255 }),
    age: int('age'),
})

export const postTable = mysqlTable(
    'post',
    {
        id: int('id').primaryKey(),
        title: varchar('title', { length: 255 }),
        content: varchar('content', { length: 255 }),
        slug: varchar('slug', { length: 255 }),
        image: varchar('image', { length: 255 }),
        date: varchar('date', { length: 255 }),
        createdAt: varchar('createdAt', { length: 255 }),
    }
)

export const commentsTable = mysqlTable(
    'comments',
    {
        id: int('id').primaryKey().autoincrement(),
        postId: int('postId'),
        // Seeded comments point at the legacy `users` table; comments from registered users set authorId instead
        userId: int('userId'),
        authorId: varchar('authorId', { length: 36 }).references(() => user.id, { onDelete: 'cascade' }),
        // No foreign key: MySQL stops cascading deletes after 15 levels and replies nest without limit,
        // so the repository deletes a whole thread itself
        parentId: int('parentId'),
        content: varchar('content', { length: 2000 }),
        createdAt: varchar('createdAt', { length: 255 }),
        editedAt: timestamp('editedAt', { fsp: 3 }),
    },
    (table) => [
        index('comments_postId_idx').on(table.postId),
        index('comments_parentId_idx').on(table.parentId),
    ],
)

export const postLikeTable = mysqlTable(
    'post_like',
    {
        postId: int('postId').notNull().references(() => postTable.id, { onDelete: 'cascade' }),
        userId: varchar('userId', { length: 36 }).notNull().references(() => user.id, { onDelete: 'cascade' }),
        createdAt: timestamp('createdAt', { fsp: 3 }).defaultNow().notNull(),
    },
    (table) => [primaryKey({ columns: [table.postId, table.userId] })],
)

export const commentLikeTable = mysqlTable(
    'comment_like',
    {
        commentId: int('commentId').notNull().references(() => commentsTable.id, { onDelete: 'cascade' }),
        userId: varchar('userId', { length: 36 }).notNull().references(() => user.id, { onDelete: 'cascade' }),
        createdAt: timestamp('createdAt', { fsp: 3 }).defaultNow().notNull(),
    },
    (table) => [primaryKey({ columns: [table.commentId, table.userId] })],
)

export * from '../../../features/auth/data/auth.schema';
export * from '../../../features/profile/data/profile.schema';
