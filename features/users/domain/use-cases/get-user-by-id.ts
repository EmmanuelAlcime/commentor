import { assertValidId } from '@/shared/domain/errors';
import type { User } from '../entities/user';
import { UserNotFoundError } from '../errors';
import type { UserRepository } from '../repositories/user-repository';

export class GetUserById {
    constructor(private readonly users: UserRepository) {}

    async execute(id: number): Promise<User> {
        assertValidId(id);
        const user = await this.users.findById(id);
        if (!user) {
            throw new UserNotFoundError(id);
        }
        return user;
    }
}
