import { APIError } from 'better-auth/api';
import { describe, expect, it } from 'vitest';
import { toAuthError, toAuthUser } from '@/features/auth/data/auth.mapper';
import {
    EmailAlreadyRegisteredError,
    InvalidCredentialsError,
    InvalidRegistrationError,
} from '@/features/auth/domain/errors';

const apiError = (code: string, message = 'Better Auth error') => new APIError('BAD_REQUEST', { code, message });

describe('toAuthUser', () => {
    it('keeps only the public fields', () => {
        const user = toAuthUser({
            id: 'abc',
            name: 'Jane Doe',
            email: 'jane@example.com',
            image: 'https://example.com/jane.png',
            emailVerified: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        } as Parameters<typeof toAuthUser>[0]);

        expect(user).toEqual({ id: 'abc', name: 'Jane Doe', email: 'jane@example.com', image: 'https://example.com/jane.png' });
    });

    it.each([undefined, null])('maps a missing image (%s) to null', (image) => {
        expect(toAuthUser({ id: 'abc', name: 'Jane', email: 'jane@example.com', image }).image).toBeNull();
    });
});

describe('toAuthError', () => {
    it.each(['USER_ALREADY_EXISTS', 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL'])('maps %s to EmailAlreadyRegisteredError', (code) => {
        const error = toAuthError(apiError(code), 'jane@example.com');

        expect(error).toBeInstanceOf(EmailAlreadyRegisteredError);
        expect((error as EmailAlreadyRegisteredError).email).toBe('jane@example.com');
    });

    it('maps INVALID_EMAIL_OR_PASSWORD to InvalidCredentialsError', () => {
        expect(toAuthError(apiError('INVALID_EMAIL_OR_PASSWORD'), 'jane@example.com')).toBeInstanceOf(InvalidCredentialsError);
    });

    it('maps INVALID_EMAIL to an email field error', () => {
        const error = toAuthError(apiError('INVALID_EMAIL'), 'nope');

        expect((error as InvalidRegistrationError).fieldErrors).toEqual({ email: 'Enter a valid email address' });
    });

    it.each(['PASSWORD_TOO_SHORT', 'PASSWORD_TOO_LONG'])('maps %s to a password field error', (code) => {
        const error = toAuthError(apiError(code, 'Password is the wrong length'), 'jane@example.com');

        expect((error as InvalidRegistrationError).fieldErrors).toEqual({ password: 'Password is the wrong length' });
    });

    it('passes unrecognised API errors through unchanged', () => {
        const error = apiError('SOMETHING_ELSE');

        expect(toAuthError(error, 'jane@example.com')).toBe(error);
    });

    it('passes non-API errors through unchanged', () => {
        const error = new Error('database down');

        expect(toAuthError(error, 'jane@example.com')).toBe(error);
    });
});
