import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { EmailAlreadyRegisteredError } from '@/features/auth/domain/errors';
import type { Profile } from '../domain/entities/profile';
import type { ProfileRepository } from '../domain/repositories/profile-repository';
import { toProfile, toProfileError } from './profile.mapper';

// Session cookies are rewritten by the nextCookies plugin, so these must run in a server action or route handler
export class BetterAuthProfileRepository implements ProfileRepository {
    async getCurrent(): Promise<Profile | null> {
        const session = await auth.api.getSession({ headers: await headers() });
        return session ? toProfile(session.user) : null;
    }

    async updateName(name: string): Promise<void> {
        try {
            await auth.api.updateUser({ body: { name }, headers: await headers() });
        } catch (error) {
            throw toProfileError(error);
        }
    }

    async changeEmail(newEmail: string): Promise<void> {
        try {
            await auth.api.changeEmail({ body: { newEmail }, headers: await headers() });
        } catch (error) {
            throw toProfileError(error, newEmail);
        }
        // Better Auth answers "ok" without changing anything when the address belongs to another account,
        // so a read-back is the only way to tell the two outcomes apart
        const profile = await this.getCurrent();
        if (profile && profile.email !== newEmail) {
            throw new EmailAlreadyRegisteredError(newEmail);
        }
    }

    async changePassword(currentPassword: string, newPassword: string): Promise<void> {
        try {
            await auth.api.changePassword({
                body: { currentPassword, newPassword, revokeOtherSessions: true },
                headers: await headers(),
            });
        } catch (error) {
            throw toProfileError(error);
        }
    }

    async setImage(image: string | null): Promise<void> {
        try {
            await auth.api.updateUser({ body: { image }, headers: await headers() });
        } catch (error) {
            throw toProfileError(error);
        }
    }

    async deleteAccount(password: string): Promise<void> {
        try {
            // Comments, likes, sessions, accounts and the stored picture go with the user through foreign keys
            await auth.api.deleteUser({ body: { password }, headers: await headers() });
        } catch (error) {
            throw toProfileError(error);
        }
    }
}
