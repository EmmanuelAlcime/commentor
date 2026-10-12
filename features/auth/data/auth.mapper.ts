import { isAPIError } from 'better-auth/api';
import type { AuthUser } from '../domain/entities/auth-user';
import { EmailAlreadyRegisteredError, InvalidCredentialsError, InvalidRegistrationError } from '../domain/errors';

export type BetterAuthUser = {
    id: string;
    name: string;
    email: string;
    image?: string | null;
};

export function toAuthUser(user: BetterAuthUser): AuthUser {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image ?? null,
    };
}

// Translates Better Auth API errors into domain errors; anything unrecognised is rethrown as is
export function toAuthError(error: unknown, email: string): unknown {
    if (!isAPIError(error)) return error;

    switch (error.body?.code) {
        case 'USER_ALREADY_EXISTS':
        case 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL':
            return new EmailAlreadyRegisteredError(email);
        case 'INVALID_EMAIL_OR_PASSWORD':
            return new InvalidCredentialsError();
        case 'INVALID_EMAIL':
            return new InvalidRegistrationError({ email: 'Enter a valid email address' });
        case 'PASSWORD_TOO_SHORT':
        case 'PASSWORD_TOO_LONG':
            return new InvalidRegistrationError({ password: error.message });
        default:
            return error;
    }
}
