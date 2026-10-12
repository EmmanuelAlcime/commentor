'use server';

import { redirect } from 'next/navigation';
import { registerUser, signInUser, signOutUser } from '@/features/auth/di';
import {
    EmailAlreadyRegisteredError,
    InvalidCredentialsError,
    InvalidRegistrationError,
} from '@/features/auth/domain/errors';
import { safeCallbackURL } from '../callback-url';
import type { AuthFormState } from './auth-form-state';

const field = (formData: FormData, name: string) => {
    const value = formData.get(name);
    return typeof value === 'string' ? value : '';
};

export async function signInAction(_previous: AuthFormState, formData: FormData): Promise<AuthFormState> {
    const email = field(formData, 'email');

    try {
        await signInUser({ email, password: field(formData, 'password') });
    } catch (error) {
        if (error instanceof InvalidCredentialsError) {
            return { error: 'Invalid email or password', values: { email } };
        }
        throw error;
    }

    redirect(safeCallbackURL(field(formData, 'callbackURL')));
}

export async function registerAction(_previous: AuthFormState, formData: FormData): Promise<AuthFormState> {
    const name = field(formData, 'name');
    const email = field(formData, 'email');

    try {
        await registerUser({
            name,
            email,
            password: field(formData, 'password'),
            confirmPassword: field(formData, 'confirmPassword'),
            // An unchecked checkbox is simply absent from the form data
            acceptTerms: field(formData, 'acceptTerms') === 'on',
        });
    } catch (error) {
        if (error instanceof InvalidRegistrationError) {
            return { fieldErrors: error.fieldErrors, values: { name, email } };
        }
        if (error instanceof EmailAlreadyRegisteredError) {
            return { fieldErrors: { email: 'An account with this email already exists' }, values: { name, email } };
        }
        throw error;
    }

    redirect(safeCallbackURL(field(formData, 'callbackURL')));
}

export async function signOutAction(): Promise<void> {
    await signOutUser();
    redirect('/');
}
