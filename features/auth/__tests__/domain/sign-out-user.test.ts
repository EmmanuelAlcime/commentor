import { describe, expect, it } from 'vitest';
import { SignOutUser } from '@/features/auth/domain/use-cases/sign-out-user';
import { InMemoryAuthRepository, makeAuthUser } from './fake-auth-repository';

describe('SignOutUser', () => {
    it('ends the current session', async () => {
        const repository = new InMemoryAuthRepository();
        repository.currentUser = makeAuthUser();

        await new SignOutUser(repository).execute();

        expect(repository.currentUser).toBeNull();
    });

    it('does nothing when no one is signed in', async () => {
        await expect(new SignOutUser(new InMemoryAuthRepository()).execute()).resolves.toBeUndefined();
    });
});
