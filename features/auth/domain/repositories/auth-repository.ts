import type { AuthUser, Credentials, Registration } from '../entities/auth-user';

export interface AuthRepository {
    // Creates the account and starts a session for it
    register(registration: Registration): Promise<AuthUser>;
    signIn(credentials: Credentials): Promise<AuthUser>;
    signOut(): Promise<void>;
    getCurrentUser(): Promise<AuthUser | null>;
}
