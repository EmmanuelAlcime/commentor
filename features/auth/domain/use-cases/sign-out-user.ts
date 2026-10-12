import type { AuthRepository } from '../repositories/auth-repository';

export class SignOutUser {
    constructor(private readonly auth: AuthRepository) {}

    async execute(): Promise<void> {
        await this.auth.signOut();
    }
}
