import { describe, expect, it } from 'vitest';
import { GetAvatar } from '@/features/profile/domain/use-cases/get-avatar';
import { InMemoryAvatarRepository, makeAvatar } from './fake-profile-repository';

describe('GetAvatar', () => {
    const avatar = makeAvatar();
    const useCase = new GetAvatar(new InMemoryAvatarRepository([avatar]));

    it('returns the stored picture', async () => {
        await expect(useCase.execute('user-1')).resolves.toEqual(avatar);
    });

    it('returns null for a user without a picture', async () => {
        await expect(useCase.execute('user-2')).resolves.toBeNull();
    });

    it.each(['', '  '])('returns null for an invalid user id %j', async (userId) => {
        await expect(useCase.execute(userId)).resolves.toBeNull();
    });
});
