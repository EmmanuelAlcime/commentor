import type { User } from '@/features/users/domain/entities/user';
import type { UserRepository } from '@/features/users/domain/repositories/user-repository';

export class InMemoryUserRepository implements UserRepository {
    constructor(private readonly users: User[] = []) {}

    async findAll(): Promise<User[]> {
        return [...this.users];
    }

    async findById(id: number): Promise<User | null> {
        return this.users.find((user) => user.id === id) ?? null;
    }
}

export const makeUser = (overrides: Partial<User> = {}): User => ({
    id: 1,
    username: 'jane.doe1',
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe1@example.com',
    age: 30,
    ...overrides,
});
