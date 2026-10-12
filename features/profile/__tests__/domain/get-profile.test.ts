import { describe, expect, it } from 'vitest';
import { UnauthenticatedError } from '@/features/auth/domain/errors';
import { GetProfile } from '@/features/profile/domain/use-cases/get-profile';
import { InMemoryProfileRepository, makeProfile } from './fake-profile-repository';

describe('GetProfile', () => {
    it('returns the signed-in user’s profile', async () => {
        const profile = makeProfile({ name: 'Grace' });
        await expect(new GetProfile(new InMemoryProfileRepository(profile)).execute()).resolves.toEqual(profile);
    });

    it('throws UnauthenticatedError when nobody is signed in', async () => {
        await expect(new GetProfile(new InMemoryProfileRepository(null)).execute()).rejects.toBeInstanceOf(UnauthenticatedError);
    });
});
