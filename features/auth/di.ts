import { cache } from 'react';
import { BetterAuthRepository } from './data/auth.repository';
import type { Credentials, RegistrationInput } from './domain/entities/auth-user';
import { GetCurrentUser } from './domain/use-cases/get-current-user';
import { RegisterUser } from './domain/use-cases/register-user';
import { RequireCurrentUser } from './domain/use-cases/require-current-user';
import { SignInUser } from './domain/use-cases/sign-in-user';
import { SignOutUser } from './domain/use-cases/sign-out-user';

const authRepository = new BetterAuthRepository();

export const registerUser = (input: RegistrationInput) => new RegisterUser(authRepository).execute(input);
export const signInUser = (credentials: Credentials) => new SignInUser(authRepository).execute(credentials);
export const signOutUser = () => new SignOutUser(authRepository).execute();
// Cached per request so the header can render the user menu twice (bar and mobile overlay) with one session lookup
export const getCurrentUser = cache(() => new GetCurrentUser(authRepository).execute());
export const requireCurrentUser = () => new RequireCurrentUser(authRepository).execute();
