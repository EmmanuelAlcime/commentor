import type { Profile } from '../entities/profile';

// Every method acts on the signed-in user, whose identity comes from the session rather than from an argument
export interface ProfileRepository {
    getCurrent(): Promise<Profile | null>;
    updateName(name: string): Promise<void>;
    // Throws EmailAlreadyRegisteredError when another account already uses the address
    changeEmail(newEmail: string): Promise<void>;
    // Throws IncorrectPasswordError when the current password is wrong
    changePassword(currentPassword: string, newPassword: string): Promise<void>;
    setImage(image: string | null): Promise<void>;
    // Throws IncorrectPasswordError; on success the account, its comments, likes and sessions are gone
    deleteAccount(password: string): Promise<void>;
}
