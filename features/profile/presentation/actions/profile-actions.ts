'use server';

import { refresh } from 'next/cache';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/features/auth/di';
import { EmailAlreadyRegisteredError, UnauthenticatedError } from '@/features/auth/domain/errors';
import { changeEmail, changePassword, deleteAccount, removeAvatar, updateProfileName, uploadAvatar } from '@/features/profile/di';
import { AVATAR_MAX_BYTES } from '@/features/profile/domain/entities/avatar';
import { IncorrectPasswordError, InvalidAvatarError, InvalidProfileInputError } from '@/features/profile/domain/errors';
import type { ProfileFormState } from './profile-form-state';

const SETTINGS_PATH = '/profile/settings';
const loginHref = `/login?callbackURL=${encodeURIComponent(SETTINGS_PATH)}`;

const field = (formData: FormData, name: string) => {
    const value = formData.get(name);
    return typeof value === 'string' ? value : '';
};

const error = (message: string, extra: Omit<ProfileFormState, 'status' | 'message'> = {}): ProfileFormState => ({
    status: 'error',
    message,
    ...extra,
});

// Every profile action needs a signed-in user; an expired session goes back through login and returns here
async function requireUser() {
    const user = await getCurrentUser();
    if (!user) redirect(loginHref);
    return user;
}

const avatarMessages: Record<InvalidAvatarError['reason'], string> = {
    empty: 'Choose an image to upload.',
    'too-large': `Images must be ${AVATAR_MAX_BYTES / (1024 * 1024)} MB or smaller.`,
    'unsupported-type': 'Use a PNG, JPEG, WebP or GIF image.',
};

export async function updateNameAction(_previous: ProfileFormState, formData: FormData): Promise<ProfileFormState> {
    await requireUser();
    const name = field(formData, 'name');

    try {
        await updateProfileName({ name });
    } catch (err) {
        if (err instanceof InvalidProfileInputError) return { status: 'error', fieldErrors: err.fieldErrors, values: { name } };
        if (err instanceof UnauthenticatedError) redirect(loginHref);
        throw err;
    }

    refresh();
    return { status: 'success', message: 'Name updated.' };
}

export async function changeEmailAction(_previous: ProfileFormState, formData: FormData): Promise<ProfileFormState> {
    await requireUser();
    const email = field(formData, 'email');

    try {
        await changeEmail({ email });
    } catch (err) {
        if (err instanceof InvalidProfileInputError) return { status: 'error', fieldErrors: err.fieldErrors, values: { email } };
        if (err instanceof EmailAlreadyRegisteredError) {
            return { status: 'error', fieldErrors: { email: 'An account with this email already exists' }, values: { email } };
        }
        if (err instanceof UnauthenticatedError) redirect(loginHref);
        throw err;
    }

    refresh();
    return { status: 'success', message: 'Email updated.' };
}

export async function changePasswordAction(_previous: ProfileFormState, formData: FormData): Promise<ProfileFormState> {
    await requireUser();

    try {
        await changePassword({
            currentPassword: field(formData, 'currentPassword'),
            newPassword: field(formData, 'newPassword'),
            confirmPassword: field(formData, 'confirmPassword'),
        });
    } catch (err) {
        if (err instanceof InvalidProfileInputError) return { status: 'error', fieldErrors: err.fieldErrors };
        if (err instanceof IncorrectPasswordError) return { status: 'error', fieldErrors: { currentPassword: 'Incorrect password' } };
        if (err instanceof UnauthenticatedError) redirect(loginHref);
        throw err;
    }

    return { status: 'success', message: 'Password changed. Any other devices have been signed out.' };
}

export async function uploadAvatarAction(_previous: ProfileFormState, formData: FormData): Promise<ProfileFormState> {
    const user = await requireUser();
    const file = formData.get('avatar');

    if (!(file instanceof File) || file.size === 0) return error(avatarMessages.empty);
    // Checked before reading the bytes so an oversized file is never buffered
    if (file.size > AVATAR_MAX_BYTES) return error(avatarMessages['too-large']);

    try {
        await uploadAvatar({ userId: user.id, data: new Uint8Array(await file.arrayBuffer()) });
    } catch (err) {
        if (err instanceof InvalidAvatarError) return error(avatarMessages[err.reason]);
        if (err instanceof UnauthenticatedError) redirect(loginHref);
        throw err;
    }

    refresh();
    return { status: 'success', message: 'Profile picture updated.' };
}

export async function removeAvatarAction(): Promise<ProfileFormState> {
    const user = await requireUser();

    try {
        await removeAvatar(user.id);
    } catch (err) {
        if (err instanceof UnauthenticatedError) redirect(loginHref);
        throw err;
    }

    refresh();
    return { status: 'success', message: 'Profile picture removed.' };
}

export async function deleteAccountAction(_previous: ProfileFormState, formData: FormData): Promise<ProfileFormState> {
    await requireUser();

    if (field(formData, 'confirmDelete') !== 'on') {
        return error('Tick the box to confirm you want to delete your account.');
    }

    try {
        await deleteAccount({ password: field(formData, 'password') });
    } catch (err) {
        if (err instanceof InvalidProfileInputError) return { status: 'error', fieldErrors: err.fieldErrors };
        if (err instanceof IncorrectPasswordError) return { status: 'error', fieldErrors: { password: 'Incorrect password' } };
        if (err instanceof UnauthenticatedError) redirect(loginHref);
        throw err;
    }

    redirect('/');
}
