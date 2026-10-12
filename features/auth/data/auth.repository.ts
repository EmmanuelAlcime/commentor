import { headers } from 'next/headers';
import { connection } from 'next/server';
import { auth } from '@/lib/auth';
import type { AuthUser, Credentials, Registration } from '../domain/entities/auth-user';
import type { AuthRepository } from '../domain/repositories/auth-repository';
import { toAuthError, toAuthUser } from './auth.mapper';

// Session cookies are written by the nextCookies plugin, so these must run in a server action or route handler
export class BetterAuthRepository implements AuthRepository {
    async register({ name, email, password, termsAcceptedAt }: Registration): Promise<AuthUser> {
        try {
            const { user } = await auth.api.signUpEmail({
                body: { name, email, password, termsAcceptedAt },
                headers: await headers(),
            });
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
        // Better Auth compares the session expiry against `new Date()`, which Next's prerender validation flags
        // once a session cookie is present; declaring the read request-bound keeps it out of the static shell
        await connection();
        const session = await auth.api.getSession({ headers: await headers() });
        return session ? toAuthUser(session.user) : null;
    }
}
