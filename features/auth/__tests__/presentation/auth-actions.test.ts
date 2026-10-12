import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    EmailAlreadyRegisteredError,
    InvalidCredentialsError,
    InvalidRegistrationError,
} from '@/features/auth/domain/errors';

const di = vi.hoisted(() => ({
    registerUser: vi.fn(),
    signInUser: vi.fn(),
    signOutUser: vi.fn(),
}));

// redirect() throws in Next.js to stop the action; mirror that so code after it never runs
const redirect = vi.hoisted(() =>
    vi.fn((url: string) => {
        throw new Error(`NEXT_REDIRECT:${url}`);
    }),
);

vi.mock('@/features/auth/di', () => di);
vi.mock('next/navigation', () => ({ redirect }));

const { registerAction, signInAction, signOutAction } = await import('@/features/auth/presentation/actions/auth-actions');

const form = (fields: Record<string, string>) => {
    const formData = new FormData();
    for (const [key, value] of Object.entries(fields)) formData.set(key, value);
    return formData;
};

beforeEach(() => {
    vi.clearAllMocks();
});

describe('signInAction', () => {
    it('signs in and redirects to the callback URL', async () => {
        await expect(
            signInAction({}, form({ email: 'jane@example.com', password: 'correct-horse', callbackURL: '/my-post' })),
        ).rejects.toThrow('NEXT_REDIRECT:/my-post');
        expect(di.signInUser).toHaveBeenCalledWith({ email: 'jane@example.com', password: 'correct-horse' });
    });

    it('redirects home when the callback URL points off-site', async () => {
        await expect(
            signInAction({}, form({ email: 'jane@example.com', password: 'correct-horse', callbackURL: 'https://evil.example' })),
        ).rejects.toThrow('NEXT_REDIRECT:/');
    });

    it('returns an error and keeps the email when the credentials are wrong', async () => {
        di.signInUser.mockRejectedValueOnce(new InvalidCredentialsError());

        await expect(signInAction({}, form({ email: 'jane@example.com', password: 'nope' }))).resolves.toEqual({
            error: 'Invalid email or password',
            values: { email: 'jane@example.com' },
        });
        expect(redirect).not.toHaveBeenCalled();
    });

    it('treats missing fields as empty strings', async () => {
        di.signInUser.mockRejectedValueOnce(new InvalidCredentialsError());

        await signInAction({}, form({}));

        expect(di.signInUser).toHaveBeenCalledWith({ email: '', password: '' });
    });

    it('rethrows unexpected errors', async () => {
        di.signInUser.mockRejectedValueOnce(new Error('database down'));

        await expect(signInAction({}, form({ email: 'jane@example.com', password: 'x' }))).rejects.toThrow('database down');
    });
});

describe('registerAction', () => {
    const fields = { name: 'Jane', email: 'jane@example.com', password: 'correct-horse', confirmPassword: 'correct-horse' };

    it('registers and redirects to the callback URL', async () => {
        await expect(registerAction({}, form({ ...fields, callbackURL: '/my-post' }))).rejects.toThrow('NEXT_REDIRECT:/my-post');
        expect(di.registerUser).toHaveBeenCalledWith(fields);
    });

    it('returns field errors and keeps name and email, but not the password', async () => {
        di.registerUser.mockRejectedValueOnce(new InvalidRegistrationError({ password: 'Too short' }));

        const state = await registerAction({}, form(fields));

        expect(state).toEqual({
            fieldErrors: { password: 'Too short' },
            values: { name: 'Jane', email: 'jane@example.com' },
        });
    });

    it('returns an email field error when the email is taken', async () => {
        di.registerUser.mockRejectedValueOnce(new EmailAlreadyRegisteredError('jane@example.com'));

        await expect(registerAction({}, form(fields))).resolves.toMatchObject({
            fieldErrors: { email: 'An account with this email already exists' },
        });
        expect(redirect).not.toHaveBeenCalled();
    });

    it('rethrows unexpected errors', async () => {
        di.registerUser.mockRejectedValueOnce(new Error('database down'));

        await expect(registerAction({}, form(fields))).rejects.toThrow('database down');
    });
});

describe('signOutAction', () => {
    it('signs out and redirects home', async () => {
        await expect(signOutAction()).rejects.toThrow('NEXT_REDIRECT:/');
        expect(di.signOutUser).toHaveBeenCalledOnce();
    });
});
