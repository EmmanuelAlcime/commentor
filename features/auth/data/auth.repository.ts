import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import type { AuthUser, Credentials, Registration } from '../domain/entities/auth-user';
import type { AuthRepository } from '../domain/repositories/auth-repository';
import { toAuthError, toAuthUser } from './auth.mapper';

// Session cookies are written by the nextCookies plugin, so these must run in a server action or route handler
export class BetterAuthRepository implements AuthRepository {
    async register({ name, email, password }: Registration): Promise<AuthUser> {
        try {
            const { user } = await auth.api.signUpEmail({ body: { name, email, password }, headers: await headers() });
            return toAuthUser(user);
        } catch (error) {
            throw toAuthError(error, email);
        }
    }

    async signIn({ email, password }: Credentials): Promise<AuthUser> {
        try {
            const { user } = await auth.api.signInEmail({ body: { email, password }, headers: await headers() });
            return toAuthUser(user);
        } catch (error) {
            throw toAuthError(error, email);
        }
    }

    async signOut(): Promise<void> {
        await auth.api.signOut({ headers: await headers() });
    }

    async getCurrentUser(): Promise<AuthUser | null> {
        const session = await auth.api.getSession({ headers: await headers() });
        return session ? toAuthUser(session.user) : null;
    }
}
