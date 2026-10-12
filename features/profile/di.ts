import { cache } from 'react';
import { DrizzleAvatarRepository } from './data/avatar.repository';
import { BetterAuthProfileRepository } from './data/profile.repository';
import { ChangeEmail, type ChangeEmailInput } from './domain/use-cases/change-email';
import { ChangePassword, type ChangePasswordInput } from './domain/use-cases/change-password';
import { DeleteAccount, type DeleteAccountInput } from './domain/use-cases/delete-account';
import { GetAvatar } from './domain/use-cases/get-avatar';
import { GetProfile } from './domain/use-cases/get-profile';
import { RemoveAvatar } from './domain/use-cases/remove-avatar';
import { UpdateProfileName, type UpdateProfileNameInput } from './domain/use-cases/update-profile-name';
import { UploadAvatar, type UploadAvatarInput } from './domain/use-cases/upload-avatar';

const profileRepository = new BetterAuthProfileRepository();
const avatarRepository = new DrizzleAvatarRepository();

// Cached per request so the profile pages can render the summary and a form with one session lookup
export const getProfile = cache(() => new GetProfile(profileRepository).execute());
export const updateProfileName = (input: UpdateProfileNameInput) => new UpdateProfileName(profileRepository).execute(input);
export const changeEmail = (input: ChangeEmailInput) => new ChangeEmail(profileRepository).execute(input);
export const changePassword = (input: ChangePasswordInput) => new ChangePassword(profileRepository).execute(input);
export const uploadAvatar = (input: UploadAvatarInput) => new UploadAvatar(avatarRepository, profileRepository).execute(input);
export const removeAvatar = (userId: string) => new RemoveAvatar(avatarRepository, profileRepository).execute(userId);
export const getAvatar = (userId: string) => new GetAvatar(avatarRepository).execute(userId);
export const deleteAccount = (input: DeleteAccountInput) => new DeleteAccount(profileRepository).execute(input);
