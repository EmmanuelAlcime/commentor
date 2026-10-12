import type { User } from '../entities/user';
import type { UserRepository } from '../repositories/user-repository';

export class GetUsers {
    constructor(private readonly users: UserRepository) {}

    execute(): Promise<User[]> {
        return this.users.findAll();
    }
}
