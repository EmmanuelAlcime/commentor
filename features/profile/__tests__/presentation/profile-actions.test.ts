import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EmailAlreadyRegisteredError, UnauthenticatedError } from '@/features/auth/domain/errors';
import { AVATAR_MAX_BYTES } from '@/features/profile/domain/entities/avatar';
import { IncorrectPasswordError, InvalidAvatarError, InvalidProfileInputError } from '@/features/profile/domain/errors';
import { initialProfileFormState } from '@/features/profile/presentation/actions/profile-form-state';
import { PNG_BYTES } from '../domain/fake-profile-repository';

const auth = vi.hoisted(() => ({ getCurrentUser: vi.fn() }));
const di = vi.hoisted(() => ({
    updateProfileName: vi.fn(),
    changeEmail: vi.fn(),
    changePassword: vi.fn(),
    uploadAvatar: vi.fn(),
    removeAvatar: vi.fn(),
    deleteAccount: vi.fn(),
}));
const refresh = vi.hoisted(() => vi.fn());
// redirect() throws in Next.js to stop the action; mirror that so code after it never runs
const redirect = vi.hoisted(() =>
    vi.fn((url: string) => {
        throw new Error(`NEXT_REDIRECT:${url}`);
    }),
);

vi.mock('@/features/auth/di', () => auth);
vi.mock('@/features/profile/di', () => di);
vi.mock('next/cache', () => ({ refresh }));
vi.mock('next/navigation', () => ({ redirect }));

const {
    changeEmailAction,
    changePasswordAction,
    deleteAccountAction,
    removeAvatarAction,
    updateNameAction,
    uploadAvatarAction,
} = await import('@/features/profile/presentation/actions/profile-actions');

const LOGIN = 'NEXT_REDIRECT:/login?callbackURL=%2Fprofile%2Fsettings';

const form = (fields: Record<string, string | Blob>) => {
    const formData = new FormData();
    for (const [key, value] of Object.entries(fields)) formData.set(key, value);
    return formData;
};

const signedIn = () => auth.getCurrentUser.mockResolvedValue({ id: 'user-1', name: 'Jane', email: 'jane@example.com', image: null });

beforeEach(() => {
    vi.clearAllMocks();
    signedIn();
});

describe('updateNameAction', () => {
    it('saves the name and refreshes the page', async () => {
        const state = await updateNameAction(initialProfileFormState, form({ name: 'Grace' }));

        expect(di.updateProfileName).toHaveBeenCalledWith({ name: 'Grace' });
        expect(refresh).toHaveBeenCalledOnce();
        expect(state).toEqual({ status: 'success', message: 'Name updated.' });
    });

    it('returns field errors and keeps what was typed', async () => {
        di.updateProfileName.mockRejectedValueOnce(new InvalidProfileInputError({ name: 'Enter your name' }));

        const state = await updateNameAction(initialProfileFormState, form({ name: '  ' }));

        expect(state).toEqual({ status: 'error', fieldErrors: { name: 'Enter your name' }, values: { name: '  ' } });
        expect(refresh).not.toHaveBeenCalled();
    });

    it('sends a signed-out user to log in without saving', async () => {
        auth.getCurrentUser.mockResolvedValue(null);

        await expect(updateNameAction(initialProfileFormState, form({ name: 'Grace' }))).rejects.toThrow(LOGIN);
        expect(di.updateProfileName).not.toHaveBeenCalled();
    });

    it('sends the user to log in when the session expired meanwhile', async () => {
        di.updateProfileName.mockRejectedValueOnce(new UnauthenticatedError());

        await expect(updateNameAction(initialProfileFormState, form({ name: 'Grace' }))).rejects.toThrow(LOGIN);
    });

    it('rethrows unexpected errors', async () => {
        di.updateProfileName.mockRejectedValueOnce(new Error('database down'));

        await expect(updateNameAction(initialProfileFormState, form({ name: 'Grace' }))).rejects.toThrow('database down');
    });
});

describe('changeEmailAction', () => {
    it('saves the email and refreshes the page', async () => {
        const state = await changeEmailAction(initialProfileFormState, form({ email: 'grace@example.com' }));

        expect(di.changeEmail).toHaveBeenCalledWith({ email: 'grace@example.com' });
        expect(refresh).toHaveBeenCalledOnce();
        expect(state).toEqual({ status: 'success', message: 'Email updated.' });
    });

    it('returns field errors and keeps what was typed', async () => {
        di.changeEmail.mockRejectedValueOnce(new InvalidProfileInputError({ email: 'Enter a valid email address' }));

        await expect(changeEmailAction(initialProfileFormState, form({ email: 'nope' }))).resolves.toEqual({
            status: 'error',
            fieldErrors: { email: 'Enter a valid email address' },
            values: { email: 'nope' },
        });
    });

    it('explains that the email is taken', async () => {
        di.changeEmail.mockRejectedValueOnce(new EmailAlreadyRegisteredError('taken@example.com'));

        await expect(changeEmailAction(initialProfileFormState, form({ email: 'taken@example.com' }))).resolves.toMatchObject({
            fieldErrors: { email: 'An account with this email already exists' },
        });
        expect(refresh).not.toHaveBeenCalled();
    });

    it('treats a missing field as empty', async () => {
        di.changeEmail.mockRejectedValueOnce(new InvalidProfileInputError({ email: 'Enter a valid email address' }));

        await changeEmailAction(initialProfileFormState, form({}));

        expect(di.changeEmail).toHaveBeenCalledWith({ email: '' });
    });
});

describe('changePasswordAction', () => {
    const fields = { currentPassword: 'old-password', newPassword: 'new-password', confirmPassword: 'new-password' };

    it('changes the password', async () => {
        const state = await changePasswordAction(initialProfileFormState, form(fields));

        expect(di.changePassword).toHaveBeenCalledWith(fields);
        expect(state).toMatchObject({ status: 'success' });
    });

    it('returns field errors without echoing passwords', async () => {
        di.changePassword.mockRejectedValueOnce(new InvalidProfileInputError({ confirmPassword: 'Passwords do not match' }));

        const state = await changePasswordAction(initialProfileFormState, form(fields));

        expect(state).toEqual({ status: 'error', fieldErrors: { confirmPassword: 'Passwords do not match' } });
        expect(state).not.toHaveProperty('values');
    });

    it('flags a wrong current password on its field', async () => {
        di.changePassword.mockRejectedValueOnce(new IncorrectPasswordError());

        await expect(changePasswordAction(initialProfileFormState, form(fields))).resolves.toEqual({
            status: 'error',
            fieldErrors: { currentPassword: 'Incorrect password' },
        });
    });

    it('sends a signed-out user to log in', async () => {
        auth.getCurrentUser.mockResolvedValue(null);

        await expect(changePasswordAction(initialProfileFormState, form(fields))).rejects.toThrow(LOGIN);
        expect(di.changePassword).not.toHaveBeenCalled();
    });
});

describe('uploadAvatarAction', () => {
    const png = new File([PNG_BYTES], 'me.png', { type: 'image/png' });

    it('uploads the file bytes for the signed-in user and refreshes the page', async () => {
        const state = await uploadAvatarAction(initialProfileFormState, form({ avatar: png }));

        expect(di.uploadAvatar).toHaveBeenCalledOnce();
        const [input] = di.uploadAvatar.mock.calls[0];
        expect(input.userId).toBe('user-1');
        expect(Array.from(input.data)).toEqual(Array.from(PNG_BYTES));
        expect(refresh).toHaveBeenCalledOnce();
        expect(state).toEqual({ status: 'success', message: 'Profile picture updated.' });
    });

    it.each([
        ['no file', {}],
        ['an empty file', { avatar: new File([], 'empty.png') }],
        ['a text field instead of a file', { avatar: 'not-a-file' }],
    ])('asks for an image when there is %s', async (_label, fields) => {
        const state = await uploadAvatarAction(initialProfileFormState, form(fields));

        expect(state).toEqual({ status: 'error', message: 'Choose an image to upload.' });
        expect(di.uploadAvatar).not.toHaveBeenCalled();
    });

    it('rejects an oversized file before reading it', async () => {
        const huge = new File([new Uint8Array(AVATAR_MAX_BYTES + 1)], 'huge.png', { type: 'image/png' });

        const state = await uploadAvatarAction(initialProfileFormState, form({ avatar: huge }));

        expect(state).toMatchObject({ status: 'error', message: expect.stringContaining('2 MB') });
        expect(di.uploadAvatar).not.toHaveBeenCalled();
    });

    it('explains an unsupported file type', async () => {
        di.uploadAvatar.mockRejectedValueOnce(new InvalidAvatarError('unsupported-type'));

        const state = await uploadAvatarAction(initialProfileFormState, form({ avatar: new File(['hello'], 'x.txt') }));

        expect(state).toEqual({ status: 'error', message: 'Use a PNG, JPEG, WebP or GIF image.' });
        expect(refresh).not.toHaveBeenCalled();
    });

    it('sends a signed-out user to log in', async () => {
        auth.getCurrentUser.mockResolvedValue(null);

        await expect(uploadAvatarAction(initialProfileFormState, form({ avatar: png }))).rejects.toThrow(LOGIN);
    });
});

describe('removeAvatarAction', () => {
    it('removes the picture for the signed-in user and refreshes the page', async () => {
        const state = await removeAvatarAction();

        expect(di.removeAvatar).toHaveBeenCalledWith('user-1');
        expect(refresh).toHaveBeenCalledOnce();
        expect(state).toEqual({ status: 'success', message: 'Profile picture removed.' });
    });

    it('sends a signed-out user to log in', async () => {
        auth.getCurrentUser.mockResolvedValue(null);

        await expect(removeAvatarAction()).rejects.toThrow(LOGIN);
        expect(di.removeAvatar).not.toHaveBeenCalled();
    });
});

describe('deleteAccountAction', () => {
    const fields = { password: 'correct-horse', confirmDelete: 'on' };

    it('deletes the account and redirects home', async () => {
        await expect(deleteAccountAction(initialProfileFormState, form(fields))).rejects.toThrow('NEXT_REDIRECT:/');
        expect(di.deleteAccount).toHaveBeenCalledWith({ password: 'correct-horse' });
    });

    it('requires the confirmation box to be ticked', async () => {
        const state = await deleteAccountAction(initialProfileFormState, form({ password: 'correct-horse' }));

        expect(state).toMatchObject({ status: 'error', message: expect.stringContaining('confirm') });
        expect(di.deleteAccount).not.toHaveBeenCalled();
    });

    it('flags a wrong password and keeps the account', async () => {
        di.deleteAccount.mockRejectedValueOnce(new IncorrectPasswordError());

        await expect(deleteAccountAction(initialProfileFormState, form(fields))).resolves.toEqual({
            status: 'error',
            fieldErrors: { password: 'Incorrect password' },
        });
        expect(redirect).not.toHaveBeenCalled();
    });

    it('returns field errors from the use case', async () => {
        di.deleteAccount.mockRejectedValueOnce(new InvalidProfileInputError({ password: 'Enter your password to delete your account' }));

        await expect(deleteAccountAction(initialProfileFormState, form({ password: '', confirmDelete: 'on' }))).resolves.toEqual({
            status: 'error',
            fieldErrors: { password: 'Enter your password to delete your account' },
        });
    });

    it('sends a signed-out user to log in', async () => {
        auth.getCurrentUser.mockResolvedValue(null);

        await expect(deleteAccountAction(initialProfileFormState, form(fields))).rejects.toThrow(LOGIN);
        expect(di.deleteAccount).not.toHaveBeenCalled();
    });

    it('rethrows unexpected errors', async () => {
        di.deleteAccount.mockRejectedValueOnce(new Error('database down'));

        await expect(deleteAccountAction(initialProfileFormState, form(fields))).rejects.toThrow('database down');
    });
});
