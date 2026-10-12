import { describe, expect, it } from 'vitest';
import { AVATAR_MAX_BYTES } from '@/features/profile/domain/entities/avatar';
import { InvalidAvatarError } from '@/features/profile/domain/errors';
import { UploadAvatar } from '@/features/profile/domain/use-cases/upload-avatar';
import { InMemoryAvatarRepository, InMemoryProfileRepository, JPEG_BYTES, PNG_BYTES } from './fake-profile-repository';

const uploadedAt = new Date('2026-05-06T07:08:09.000Z');

const setup = () => {
    const avatars = new InMemoryAvatarRepository();
    const profiles = new InMemoryProfileRepository();
    return { avatars, profiles, useCase: new UploadAvatar(avatars, profiles, () => uploadedAt) };
};

describe('UploadAvatar', () => {
    it('stores the picture and points the profile at it', async () => {
        const { avatars, profiles, useCase } = setup();

        const avatar = await useCase.execute({ userId: 'user-1', data: PNG_BYTES });

        expect(avatar).toEqual({ userId: 'user-1', contentType: 'image/png', data: PNG_BYTES, updatedAt: uploadedAt });
        expect(await avatars.find('user-1')).toEqual(avatar);
        expect(profiles.current?.image).toBe(`/api/avatars/user-1?v=${uploadedAt.getTime()}`);
    });

    it('replaces an existing picture', async () => {
        const { avatars, useCase } = setup();
        await useCase.execute({ userId: 'user-1', data: PNG_BYTES });

        await useCase.execute({ userId: 'user-1', data: JPEG_BYTES });

        expect((await avatars.find('user-1'))?.contentType).toBe('image/jpeg');
        expect(avatars.avatars.size).toBe(1);
    });

    it.each([
        ['empty', new Uint8Array()],
        ['too-large', new Uint8Array(AVATAR_MAX_BYTES + 1)],
        ['unsupported-type', new TextEncoder().encode('%PDF-1.4 not an image')],
    ] as const)('rejects a file that is %s', async (reason, data) => {
        const { avatars, profiles, useCase } = setup();
        const error = await useCase.execute({ userId: 'user-1', data }).catch((e: unknown) => e);

        expect(error).toBeInstanceOf(InvalidAvatarError);
        expect((error as InvalidAvatarError).reason).toBe(reason);
        expect(avatars.avatars.size).toBe(0);
        expect(profiles.current?.image).toBeNull();
    });

    it('accepts a file of exactly the maximum size', async () => {
        const { useCase } = setup();
        const data = new Uint8Array(AVATAR_MAX_BYTES);
        data.set(PNG_BYTES);

        await expect(useCase.execute({ userId: 'user-1', data })).resolves.toMatchObject({ contentType: 'image/png' });
    });
});
