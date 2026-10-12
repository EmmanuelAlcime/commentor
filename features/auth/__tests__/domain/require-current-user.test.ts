import { describe, expect, it } from 'vitest';
import { UnauthenticatedError } from '@/features/auth/domain/errors';
import { RequireCurrentUser } from '@/features/auth/domain/use-cases/require-current-user';
import { InMemoryAuthRepository, makeAuthUser } from './fake-auth-repository';

describe('RequireCurrentUser', () => {
    it('returns the signed-in user', async () => {
        const repository = new InMemoryAuthRepository();
        repository.currentUser = makeAuthUser();

        await expect(new RequireCurrentUser(repository).execute()).resolves.toEqual(makeAuthUser());
    });

    it('throws UnauthenticatedError when no one is signed in', async () => {
        await expect(new RequireCurrentUser(new InMemoryAuthRepository()).execute()).rejects.toBeInstanceOf(UnauthenticatedError);
    });
});
