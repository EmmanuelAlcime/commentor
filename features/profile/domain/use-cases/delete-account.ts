import { InvalidProfileInputError } from '../errors';
import type { ProfileRepository } from '../repositories/profile-repository';

export type DeleteAccountInput = { password: string };

export class DeleteAccount {
    constructor(private readonly profiles: ProfileRepository) {}

    async execute(input: DeleteAccountInput): Promise<void> {
        if (!input.password) {
            throw new InvalidProfileInputError({ password: 'Enter your password to delete your account' });
        }
        await this.profiles.deleteAccount(input.password);
    }
}
