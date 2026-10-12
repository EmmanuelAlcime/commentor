import type { userTable } from '@/drizzle/src/db/schema';
import type { User } from '../domain/entities/user';

export type UserRow = typeof userTable.$inferSelect;

export function toUser(row: UserRow): User {
    return {
        id: row.id,
        username: row.username,
        firstName: row.firstName,
        lastName: row.lastName,
        email: row.email,
        age: row.age,
    };
}
