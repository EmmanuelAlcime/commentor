export type RegistrationField = 'name' | 'email' | 'password' | 'confirmPassword' | 'acceptTerms';
export type RegistrationFieldErrors = Partial<Record<RegistrationField, string>>;

export class InvalidRegistrationError extends Error {
    constructor(readonly fieldErrors: RegistrationFieldErrors) {
        super('Invalid registration');
        this.name = 'InvalidRegistrationError';
    }
}

export class EmailAlreadyRegisteredError extends Error {
    constructor(readonly email: string) {
        super(`Email ${email} is already registered`);
        this.name = 'EmailAlreadyRegisteredError';
    }
}

export class InvalidCredentialsError extends Error {
    constructor() {
        super('Invalid email or password');
        this.name = 'InvalidCredentialsError';
    }
}

export class UnauthenticatedError extends Error {
    constructor() {
        super('You must be signed in');
        this.name = 'UnauthenticatedError';
    }
}
