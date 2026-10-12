import type { AuthUser } from '../entities/auth-user';
import type { AuthRepository } from '../repositories/auth-repository';

export class GetCurrentUser {
    constructor(private readonly auth: AuthRepository) {}

    async execute(): Promise<AuthUser | null> {
        return this.auth.getCurrentUser();
    }
}
