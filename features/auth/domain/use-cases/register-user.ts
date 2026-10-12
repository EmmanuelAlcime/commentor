import {
    type AuthUser,
    NAME_MAX_LENGTH,
    normalizeEmail,
    PASSWORD_MAX_LENGTH,
    PASSWORD_MIN_LENGTH,
    type RegistrationInput,
} from '../entities/auth-user';
import { InvalidRegistrationError, type RegistrationFieldErrors } from '../errors';
import type { AuthRepository } from '../repositories/auth-repository';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class RegisterUser {
    constructor(private readonly auth: AuthRepository) {}

    async execute(input: RegistrationInput): Promise<AuthUser> {
        const registration = {
            name: input.name.trim(),
            email: normalizeEmail(input.email),
            password: input.password,
        };

        const fieldErrors: RegistrationFieldErrors = {};
        if (!registration.name) {
            fieldErrors.name = 'Enter your name';
        } else if (registration.name.length > NAME_MAX_LENGTH) {
            fieldErrors.name = `Name must be ${NAME_MAX_LENGTH} characters or fewer`;
        }
        if (!EMAIL_PATTERN.test(registration.email)) {
            fieldErrors.email = 'Enter a valid email address';
        }
        if (registration.password.length < PASSWORD_MIN_LENGTH) {
            fieldErrors.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
        } else if (registration.password.length > PASSWORD_MAX_LENGTH) {
            fieldErrors.password = `Password must be ${PASSWORD_MAX_LENGTH} characters or fewer`;
        }
        if (input.confirmPassword !== registration.password) {
            fieldErrors.confirmPassword = 'Passwords do not match';
        }
        if (Object.keys(fieldErrors).length > 0) {
            throw new InvalidRegistrationError(fieldErrors);
        }

        return this.auth.register(registration);
    }
}
