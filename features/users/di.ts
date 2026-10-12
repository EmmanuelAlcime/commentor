import { DrizzleUserRepository } from './data/user.repository';
import { GetUserById } from './domain/use-cases/get-user-by-id';
import { GetUsers } from './domain/use-cases/get-users';

const userRepository = new DrizzleUserRepository();

export const getUsers = () => new GetUsers(userRepository).execute();
export const getUserById = (id: number) => new GetUserById(userRepository).execute(id);
