import { int, mysqlTable, varchar } from 'drizzle-orm/mysql-core'


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
        id: int('id').primaryKey(),
        postId: int('postId'),
        userId: int('userId'),
        content: varchar('content', { length: 255 }),
        createdAt: varchar('createdAt', { length: 255 }),
    }
)