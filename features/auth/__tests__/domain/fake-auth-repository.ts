import type { AuthUser, Credentials, Registration } from '@/features/auth/domain/entities/auth-user';
import { EmailAlreadyRegisteredError, InvalidCredentialsError } from '@/features/auth/domain/errors';
import type { AuthRepository } from '@/features/auth/domain/repositories/auth-repository';

type Account = { user: AuthUser; password: string };

export class InMemoryAuthRepository implements AuthRepository {
    currentUser: AuthUser | null = null;
    readonly registrations: Registration[] = [];
    private readonly accounts: Account[];

    constructor(accounts: Account[] = []) {
        this.accounts = [...accounts];
    }

    async register(registration: Registration): Promise<AuthUser> {
        this.registrations.push(registration);
        if (this.accounts.some((account) => account.user.email === registration.email)) {
            throw new EmailAlreadyRegisteredError(registration.email);
        }
        const user = makeAuthUser({
            id: `user-${this.accounts.length + 1}`,
            name: registration.name,
            email: registration.email,
        });
        this.accounts.push({ user, password: registration.password });
        this.currentUser = user;
        return user;
    }

    async signIn({ email, password }: Credentials): Promise<AuthUser> {
        const account = this.accounts.find((candidate) => candidate.user.email === email);
        if (!account || account.password !== password) {
            throw new InvalidCredentialsError();
        }
        this.currentUser = account.user;
        return account.user;
    }

    async signOut(): Promise<void> {
        this.currentUser = null;
    }

    async getCurrentUser(): Promise<AuthUser | null> {
        return this.currentUser;
    }
}

export const makeAuthUser = (overrides: Partial<AuthUser> = {}): AuthUser => ({
    id: 'user-1',
    name: 'Jane Doe',
    email: 'jane@example.com',
    image: null,
    ...overrides,
});
