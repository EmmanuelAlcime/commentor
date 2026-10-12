export type ProfileField = 'name' | 'email' | 'currentPassword' | 'newPassword' | 'confirmPassword' | 'password';
export type ProfileFieldErrors = Partial<Record<ProfileField, string>>;

export class InvalidProfileInputError extends Error {
    constructor(readonly fieldErrors: ProfileFieldErrors) {
        super('Invalid profile input');
        this.name = 'InvalidProfileInputError';
    }
}

// The password typed to confirm a sensitive change does not match the account's password
export class IncorrectPasswordError extends Error {
    constructor() {
        super('Incorrect password');
        this.name = 'IncorrectPasswordError';
    }
}

export type InvalidAvatarReason = 'empty' | 'too-large' | 'unsupported-type';

export class InvalidAvatarError extends Error {
    constructor(readonly reason: InvalidAvatarReason) {
        super(`Invalid avatar: ${reason}`);
        this.name = 'InvalidAvatarError';
    }
}
