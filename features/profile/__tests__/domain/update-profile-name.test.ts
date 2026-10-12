import { describe, expect, it } from 'vitest';
import { InvalidProfileInputError } from '@/features/profile/domain/errors';
import { UpdateProfileName } from '@/features/profile/domain/use-cases/update-profile-name';
import { InMemoryProfileRepository } from './fake-profile-repository';

describe('UpdateProfileName', () => {
    it('trims and saves the new name', async () => {
        const repository = new InMemoryProfileRepository();
        await new UpdateProfileName(repository).execute({ name: '  Grace Hopper ' });
        expect(repository.current?.name).toBe('Grace Hopper');
    });

    it.each([
        ['blank', '   ', 'Enter your name'],
        ['too long', 'a'.repeat(256), 'Name must be 255 characters or fewer'],
    ])('rejects a %s name', async (_label, name, message) => {
        const repository = new InMemoryProfileRepository();
        const error = await new UpdateProfileName(repository).execute({ name }).catch((e: unknown) => e);

        expect(error).toBeInstanceOf(InvalidProfileInputError);
        expect((error as InvalidProfileInputError).fieldErrors).toEqual({ name: message });
        expect(repository.current?.name).toBe('Jane Doe');
    });

    it('accepts a name of exactly the maximum length', async () => {
        await expect(new UpdateProfileName(new InMemoryProfileRepository()).execute({ name: 'a'.repeat(255) })).resolves.toBeUndefined();
    });
});
