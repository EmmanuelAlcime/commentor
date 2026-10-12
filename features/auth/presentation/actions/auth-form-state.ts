import type { RegistrationFieldErrors } from '@/features/auth/domain/errors';

export type AuthFormState = {
    error?: string;
    fieldErrors?: RegistrationFieldErrors;
    // Echoed back so the form keeps what the user typed (never the password)
    values?: { name?: string; email?: string };
};
