import { describe, expect, it } from 'vitest';
import { RemoveAvatar } from '@/features/profile/domain/use-cases/remove-avatar';
import { InMemoryAvatarRepository, InMemoryProfileRepository, makeAvatar, makeProfile } from './fake-profile-repository';

describe('RemoveAvatar', () => {
    it('deletes the picture and clears it from the profile', async () => {
        const avatars = new InMemoryAvatarRepository([makeAvatar()]);
        const profiles = new InMemoryProfileRepository(makeProfile({ image: '/api/avatars/user-1?v=1' }));

        await new RemoveAvatar(avatars, profiles).execute('user-1');

        expect(await avatars.find('user-1')).toBeNull();
        expect(profiles.current?.image).toBeNull();
    });

    it('still clears the profile when there was no stored picture', async () => {
        const profiles = new InMemoryProfileRepository(makeProfile({ image: 'https://example.com/old.png' }));

        await new RemoveAvatar(new InMemoryAvatarRepository(), profiles).execute('user-1');

        expect(profiles.current?.image).toBeNull();
    });

    it('leaves other users’ pictures alone', async () => {
        const avatars = new InMemoryAvatarRepository([makeAvatar({ userId: 'user-2' })]);

        await new RemoveAvatar(avatars, new InMemoryProfileRepository()).execute('user-1');

        expect(await avatars.find('user-2')).not.toBeNull();
    });
});
