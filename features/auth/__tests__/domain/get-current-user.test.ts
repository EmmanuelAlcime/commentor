import { describe, expect, it } from 'vitest';
import { GetCurrentUser } from '@/features/auth/domain/use-cases/get-current-user';
import { InMemoryAuthRepository, makeAuthUser } from './fake-auth-repository';

describe('GetCurrentUser', () => {
    it('returns the signed-in user', async () => {
        const repository = new InMemoryAuthRepository();
        repository.currentUser = makeAuthUser();

        await expect(new GetCurrentUser(repository).execute()).resolves.toEqual(makeAuthUser());
    });

    it('returns null when no one is signed in', async () => {
        await expect(new GetCurrentUser(new InMemoryAuthRepository()).execute()).resolves.toBeNull();
    });
});
