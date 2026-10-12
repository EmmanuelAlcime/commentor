import {
    type AuthUser,
    EMAIL_PATTERN,
    NAME_MAX_LENGTH,
    normalizeEmail,
    PASSWORD_MAX_LENGTH,
    PASSWORD_MIN_LENGTH,
    type RegistrationInput,
} from '../entities/auth-user';
import { InvalidRegistrationError, type RegistrationFieldErrors } from '../errors';
import type { AuthRepository } from '../repositories/auth-repository';

export class RegisterUser {
    // `now` is injectable so tests can pin the acceptance timestamp
    constructor(
        private readonly auth: AuthRepository,
        private readonly now: () => Date = () => new Date(),
    ) {}

    async execute(input: RegistrationInput): Promise<AuthUser> {
        const name = input.name.trim();
        const email = normalizeEmail(input.email);
        const password = input.password;

        const fieldErrors: RegistrationFieldErrors = {};
        if (!name) {
            fieldErrors.name = 'Enter your name';
        } else if (name.length > NAME_MAX_LENGTH) {
            fieldErrors.name = `Name must be ${NAME_MAX_LENGTH} characters or fewer`;
        }
        if (!EMAIL_PATTERN.test(email)) {
            fieldErrors.email = 'Enter a valid email address';
        }
        if (password.length < PASSWORD_MIN_LENGTH) {
            fieldErrors.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
        } else if (password.length > PASSWORD_MAX_LENGTH) {
            fieldErrors.password = `Password must be ${PASSWORD_MAX_LENGTH} characters or fewer`;
        }
        if (input.confirmPassword !== password) {
            fieldErrors.confirmPassword = 'Passwords do not match';
        }
        if (input.acceptTerms !== true) {
            fieldErrors.acceptTerms = 'You must accept the user agreement to create an account';
        }
        if (Object.keys(fieldErrors).length > 0) {
            throw new InvalidRegistrationError(fieldErrors);
        }

        return this.auth.register({ name, email, password, termsAcceptedAt: this.now() });
    }
}
