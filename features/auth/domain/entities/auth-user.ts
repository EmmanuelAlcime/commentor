export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
export const NAME_MAX_LENGTH = 255;

export type AuthUser = {
    id: string;
    name: string;
    email: string;
    image: string | null;
};

export type Credentials = {
    email: string;
    password: string;
};

// What gets stored: sent to the repository once validated
export type Registration = Credentials & {
    name: string;
};

// What the user submits: the confirmation is checked in the use case and never stored
export type RegistrationInput = Registration & {
    confirmPassword: string;
};

export const normalizeEmail = (email: string) => email.trim().toLowerCase();
