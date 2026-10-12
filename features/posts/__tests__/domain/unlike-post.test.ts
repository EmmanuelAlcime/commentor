import { describe, expect, it } from 'vitest';
import { UnlikePost } from '@/features/posts/domain/use-cases/unlike-post';
import { InvalidIdError } from '@/shared/domain/errors';
import { InMemoryPostLikeRepository } from './fake-post-like-repository';

describe('UnlikePost', () => {
    it('removes only this user’s like', async () => {
        const likes = new InMemoryPostLikeRepository();
        likes.likes.add('1:user-1');
        likes.likes.add('1:user-2');

        await new UnlikePost(likes).execute({ postId: 1, userId: 'user-1' });

        expect([...likes.likes]).toEqual(['1:user-2']);
    });

    it('does nothing when the user had not liked the post', async () => {
        await expect(
            new UnlikePost(new InMemoryPostLikeRepository()).execute({ postId: 1, userId: 'user-1' }),
        ).resolves.toBeUndefined();
    });

    it('throws InvalidIdError for an invalid post id', async () => {
        await expect(
            new UnlikePost(new InMemoryPostLikeRepository()).execute({ postId: 0, userId: 'user-1' }),
        ).rejects.toBeInstanceOf(InvalidIdError);
    });
});
