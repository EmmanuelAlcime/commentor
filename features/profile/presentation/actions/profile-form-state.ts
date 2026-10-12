import type { ProfileFieldErrors } from '@/features/profile/domain/errors';

export type ProfileFormState = {
    status: 'idle' | 'success' | 'error';
    // Shown above the form: a confirmation on success, an explanation on error
    message?: string;
    fieldErrors?: ProfileFieldErrors;
    // Echoed back so the form keeps what the user typed (never passwords)
    values?: { name?: string; email?: string };
};

export const initialProfileFormState: ProfileFormState = { status: 'idle' };
