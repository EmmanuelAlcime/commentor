import { describe, expect, it } from 'vitest';
import { GetUsers } from '@/features/users/domain/use-cases/get-users';
import { InMemoryUserRepository, makeUser } from './fake-user-repository';

describe('GetUsers', () => {
    it('returns every user', async () => {
        const users = [makeUser({ id: 1 }), makeUser({ id: 2 })];
        const result = await new GetUsers(new InMemoryUserRepository(users)).execute();
        expect(result).toEqual(users);
    });

    it('returns an empty list when there are no users', async () => {
        const result = await new GetUsers(new InMemoryUserRepository()).execute();
        expect(result).toEqual([]);
    });
});
