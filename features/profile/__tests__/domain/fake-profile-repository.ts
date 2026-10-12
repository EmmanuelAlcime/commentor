import { EmailAlreadyRegisteredError } from '@/features/auth/domain/errors';
import type { AvatarImage } from '@/features/profile/domain/entities/avatar';
import type { Profile } from '@/features/profile/domain/entities/profile';
import { IncorrectPasswordError } from '@/features/profile/domain/errors';
import type { AvatarRepository } from '@/features/profile/domain/repositories/avatar-repository';
import type { ProfileRepository } from '@/features/profile/domain/repositories/profile-repository';

type Options = {
    // Emails already used by other accounts
    takenEmails?: string[];
};

export class InMemoryProfileRepository implements ProfileRepository {
    // null means nobody is signed in
    current: Profile | null;
    password: string;
    deleted = false;
    private readonly takenEmails: Set<string>;

    constructor(current: Profile | null = makeProfile(), password = 'correct-horse', { takenEmails = [] }: Options = {}) {
        this.current = current;
        this.password = password;
        this.takenEmails = new Set(takenEmails);
    }

    private get user(): Profile {
        if (!this.current) throw new Error('No signed-in user');
        return this.current;
    }

    async getCurrent(): Promise<Profile | null> {
        return this.current;
    }

    async updateName(name: string): Promise<void> {
        this.current = { ...this.user, name };
    }

    async changeEmail(newEmail: string): Promise<void> {
        if (this.takenEmails.has(newEmail)) throw new EmailAlreadyRegisteredError(newEmail);
        this.current = { ...this.user, email: newEmail };
    }

    async changePassword(currentPassword: string, newPassword: string): Promise<void> {
        if (currentPassword !== this.password) throw new IncorrectPasswordError();
        this.password = newPassword;
    }

    async setImage(image: string | null): Promise<void> {
        this.current = { ...this.user, image };
    }

    async deleteAccount(password: string): Promise<void> {
        if (password !== this.password) throw new IncorrectPasswordError();
        this.deleted = true;
        this.current = null;
    }
}

export class InMemoryAvatarRepository implements AvatarRepository {
    readonly avatars = new Map<string, AvatarImage>();

    constructor(avatars: AvatarImage[] = []) {
        for (const avatar of avatars) this.avatars.set(avatar.userId, avatar);
    }

    async find(userId: string): Promise<AvatarImage | null> {
        return this.avatars.get(userId) ?? null;
    }

    async save(avatar: AvatarImage): Promise<void> {
        this.avatars.set(avatar.userId, avatar);
    }

    async remove(userId: string): Promise<void> {
        this.avatars.delete(userId);
    }
}

export const makeProfile = (overrides: Partial<Profile> = {}): Profile => ({
    id: 'user-1',
    name: 'Jane Doe',
    email: 'jane@example.com',
    image: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
});

// Minimal valid file signatures, enough for detectImageType()
export const PNG_BYTES = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0x0d]);
export const JPEG_BYTES = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46]);
export const GIF_BYTES = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 1, 0]);
export const WEBP_BYTES = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]);

export const makeAvatar = (overrides: Partial<AvatarImage> = {}): AvatarImage => ({
    userId: 'user-1',
    contentType: 'image/png',
    data: PNG_BYTES,
    updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    ...overrides,
});
