import { asc, eq } from 'drizzle-orm';
import { db } from '@/drizzle/src/db';
import { userTable } from '@/drizzle/src/db/schema';
import type { User } from '../domain/entities/user';
import type { UserRepository } from '../domain/repositories/user-repository';
import { toUser } from './user.mapper';

export class DrizzleUserRepository implements UserRepository {
    async findAll(): Promise<User[]> {
        const rows = await db.select().from(userTable).orderBy(asc(userTable.id));
        return rows.map(toUser);
    }

    async findById(id: number): Promise<User | null> {
        const [row] = await db.select().from(userTable).where(eq(userTable.id, id)).limit(1);
        return row ? toUser(row) : null;
    }
}
