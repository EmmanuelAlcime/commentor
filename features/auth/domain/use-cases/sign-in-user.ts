import { type AuthUser, type Credentials, normalizeEmail } from '../entities/auth-user';
import { InvalidCredentialsError } from '../errors';
import type { AuthRepository } from '../repositories/auth-repository';

export class SignInUser {
    constructor(private readonly auth: AuthRepository) {}

    async execute(input: Credentials): Promise<AuthUser> {
        const email = normalizeEmail(input.email);
        if (!email || !input.password) {
            throw new InvalidCredentialsError();
        }
        return this.auth.signIn({ email, password: input.password });
    }
}
