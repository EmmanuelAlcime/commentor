import type { AuthUser } from '../entities/auth-user';
import { UnauthenticatedError } from '../errors';
import type { AuthRepository } from '../repositories/auth-repository';

// For use cases that must only run for a signed-in user, such as posting a comment
export class RequireCurrentUser {
    constructor(private readonly auth: AuthRepository) {}

    async execute(): Promise<AuthUser> {
        const user = await this.auth.getCurrentUser();
        if (!user) {
            throw new UnauthenticatedError();
        }
        return user;
    }
}
