import { isAPIError } from 'better-auth/api';
import type { profileImageTable } from '@/drizzle/src/db/schema';
import { EmailAlreadyRegisteredError, UnauthenticatedError } from '@/features/auth/domain/errors';
import { AVATAR_CONTENT_TYPES, type AvatarContentType, type AvatarImage } from '../domain/entities/avatar';
import type { Profile } from '../domain/entities/profile';
import { IncorrectPasswordError, InvalidProfileInputError } from '../domain/errors';

export type SessionUser = {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    createdAt: Date;
};

export type ProfileImageRow = typeof profileImageTable.$inferSelect;

export function toProfile(user: SessionUser): Profile {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image ?? null,
        createdAt: user.createdAt,
    };
}

const isAvatarContentType = (value: string): value is AvatarContentType =>
    (AVATAR_CONTENT_TYPES as readonly string[]).includes(value);

// A stored row with an unknown content type is treated as missing rather than served with a guessed type
export function toAvatarImage(row: ProfileImageRow): AvatarImage | null {
    if (!isAvatarContentType(row.contentType)) return null;
    return {
        userId: row.userId,
        contentType: row.contentType,
        data: new Uint8Array(row.data),
        updatedAt: row.updatedAt,
    };
}

export function toAvatarRow(avatar: AvatarImage): ProfileImageRow {
    return {
        userId: avatar.userId,
        contentType: avatar.contentType,
        data: Buffer.from(avatar.data),
        updatedAt: avatar.updatedAt,
    };
}

// Translates Better Auth API errors into domain errors; anything unrecognised is rethrown as is
export function toProfileError(error: unknown, email?: string): unknown {
    if (!isAPIError(error)) return error;

    switch (error.body?.code) {
        case 'INVALID_PASSWORD':
            return new IncorrectPasswordError();
        case 'PASSWORD_TOO_SHORT':
        case 'PASSWORD_TOO_LONG':
            return new InvalidProfileInputError({ newPassword: error.message });
        case 'USER_ALREADY_EXISTS':
        case 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL':
            return new EmailAlreadyRegisteredError(email ?? '');
        case 'UNAUTHORIZED':
        case 'SESSION_EXPIRED':
            return new UnauthenticatedError();
        default:
            return error;
    }
}
