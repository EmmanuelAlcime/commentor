import { NAME_MAX_LENGTH } from '@/features/auth/domain/entities/auth-user';

export const PROFILE_NAME_MAX_LENGTH = NAME_MAX_LENGTH;

// The signed-in user's own account as shown on the profile page
export type Profile = {
    id: string;
    name: string;
    email: string;
    // Profile picture URL, or null to show initials
    image: string | null;
    createdAt: Date;
};
