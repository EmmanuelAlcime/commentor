import { describe, expect, it } from 'vitest';
import { UserNotFoundError } from '@/features/users/domain/errors';
import { GetUserById } from '@/features/users/domain/use-cases/get-user-by-id';
import { InvalidIdError } from '@/shared/domain/errors';
import { InMemoryUserRepository, makeUser } from './fake-user-repository';

describe('GetUserById', () => {
    const useCase = new GetUserById(new InMemoryUserRepository([makeUser({ id: 7 })]));

    it('returns the matching user', async () => {
        await expect(useCase.execute(7)).resolves.toMatchObject({ id: 7 });
    });

    it('throws UserNotFoundError when the user does not exist', async () => {
        await expect(useCase.execute(99)).rejects.toBeInstanceOf(UserNotFoundError);
    });

    it.each([0, -1, 1.5, Number.NaN])('throws InvalidIdError for id %s', async (id) => {
        await expect(useCase.execute(id)).rejects.toBeInstanceOf(InvalidIdError);
    });
});
