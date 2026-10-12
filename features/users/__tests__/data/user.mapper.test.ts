import { describe, expect, it } from 'vitest';
import { toUser } from '@/features/users/data/user.mapper';

describe('toUser', () => {
    it('maps a row to a user without the password', () => {
        const user = toUser({
            id: 1,
            username: 'jane.doe1',
            password: 'secret',
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'jane.doe1@example.com',
            age: 30,
        });

        expect(user).toEqual({
            id: 1,
            username: 'jane.doe1',
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'jane.doe1@example.com',
            age: 30,
        });
        expect(user).not.toHaveProperty('password');
    });
});
