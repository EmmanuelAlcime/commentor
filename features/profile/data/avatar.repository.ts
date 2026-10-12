import { eq } from 'drizzle-orm';
import { db } from '@/drizzle/src/db';
import { profileImageTable } from '@/drizzle/src/db/schema';
import type { AvatarImage } from '../domain/entities/avatar';
import type { AvatarRepository } from '../domain/repositories/avatar-repository';
import { toAvatarImage, toAvatarRow } from './profile.mapper';

export class DrizzleAvatarRepository implements AvatarRepository {
    async find(userId: string): Promise<AvatarImage | null> {
        const [row] = await db.select().from(profileImageTable).where(eq(profileImageTable.userId, userId)).limit(1);
        return row ? toAvatarImage(row) : null;
    }

    async save(avatar: AvatarImage): Promise<void> {
        const row = toAvatarRow(avatar);
        await db
            .insert(profileImageTable)
            .values(row)
            .onDuplicateKeyUpdate({ set: { contentType: row.contentType, data: row.data, updatedAt: row.updatedAt } });
    }

    async remove(userId: string): Promise<void> {
        await db.delete(profileImageTable).where(eq(profileImageTable.userId, userId));
    }
}
