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
    // When the user accepted the user agreement; kept as an audit trail
    termsAcceptedAt: Date;
};

// What the user submits: the confirmation and the agreement checkbox are checked in the use case and never stored as is
export type RegistrationInput = Credentials & {
    name: string;
    confirmPassword: string;
    acceptTerms: boolean;
};

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const normalizeEmail = (email: string) => email.trim().toLowerCase();
