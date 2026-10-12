import { redirect } from 'next/navigation';
import { UnauthenticatedError } from '@/features/auth/domain/errors';
import { getProfile } from '@/features/profile/di';
import type { Profile } from '@/features/profile/domain/entities/profile';

// For profile pages: a signed-out visitor is sent to log in and brought back to `path` afterwards
export async function requireProfile(path: string): Promise<Profile> {
    try {
        return await getProfile();
    } catch (error) {
        if (error instanceof UnauthenticatedError) redirect(`/login?callbackURL=${encodeURIComponent(path)}`);
        throw error;
    }
}
