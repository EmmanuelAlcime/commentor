import { APIError } from 'better-auth/api';
import { describe, expect, it } from 'vitest';
import { EmailAlreadyRegisteredError, UnauthenticatedError } from '@/features/auth/domain/errors';
import { type ProfileImageRow, toAvatarImage, toAvatarRow, toProfile, toProfileError } from '@/features/profile/data/profile.mapper';
import { IncorrectPasswordError, InvalidProfileInputError } from '@/features/profile/domain/errors';
import { makeAvatar, PNG_BYTES } from '../domain/fake-profile-repository';

const createdAt = new Date('2026-01-01T00:00:00.000Z');

describe('toProfile', () => {
    it('maps the session user, defaulting a missing image to null', () => {
        expect(toProfile({ id: 'user-1', name: 'Jane', email: 'jane@example.com', createdAt })).toEqual({
            id: 'user-1',
            name: 'Jane',
            email: 'jane@example.com',
            image: null,
            createdAt,
        });
    });

    it('keeps the image when there is one', () => {
        expect(toProfile({ id: 'user-1', name: 'Jane', email: 'jane@example.com', image: '/api/avatars/user-1?v=1', createdAt }).image).toBe(
            '/api/avatars/user-1?v=1',
        );
    });
});

describe('toAvatarImage', () => {
    const row: ProfileImageRow = { userId: 'user-1', contentType: 'image/png', data: Buffer.from(PNG_BYTES), updatedAt: createdAt };

    it('maps the row and exposes the bytes as a Uint8Array', () => {
        const avatar = toAvatarImage(row);

        expect(avatar).toMatchObject({ userId: 'user-1', contentType: 'image/png', updatedAt: createdAt });
        expect(Array.from(avatar?.data ?? [])).toEqual(Array.from(PNG_BYTES));
    });

    it('treats an unknown content type as no picture', () => {
        expect(toAvatarImage({ ...row, contentType: 'image/svg+xml' })).toBeNull();
    });
});

describe('toAvatarRow', () => {
    it('round-trips through toAvatarImage', () => {
        const avatar = makeAvatar();
        const row = toAvatarRow(avatar);

        expect(Buffer.isBuffer(row.data)).toBe(true);
        expect(toAvatarImage(row)).toEqual(avatar);
    });
});

describe('toProfileError', () => {
    const apiError = (code: string, message = code) => new APIError('BAD_REQUEST', { code, message });

    it('maps a wrong password', () => {
        expect(toProfileError(apiError('INVALID_PASSWORD'))).toBeInstanceOf(IncorrectPasswordError);
    });

    it('maps password length errors onto the new password field', () => {
        const error = toProfileError(apiError('PASSWORD_TOO_SHORT', 'Password too short'));

        expect(error).toBeInstanceOf(InvalidProfileInputError);
        expect((error as InvalidProfileInputError).fieldErrors).toEqual({ newPassword: 'Password too short' });
    });

    it('maps a taken email with the address that was tried', () => {
        const error = toProfileError(apiError('USER_ALREADY_EXISTS'), 'taken@example.com');

        expect(error).toBeInstanceOf(EmailAlreadyRegisteredError);
        expect((error as EmailAlreadyRegisteredError).email).toBe('taken@example.com');
    });

    it.each(['UNAUTHORIZED', 'SESSION_EXPIRED'])('maps %s to UnauthenticatedError', (code) => {
        expect(toProfileError(apiError(code))).toBeInstanceOf(UnauthenticatedError);
    });

    it('returns unknown API errors and non-API errors unchanged', () => {
        const unknown = apiError('SOMETHING_ELSE');
        const plain = new Error('database down');

        expect(toProfileError(unknown)).toBe(unknown);
        expect(toProfileError(plain)).toBe(plain);
    });
});
