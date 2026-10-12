import { describe, expect, it } from 'vitest';
import { PostNotFoundError } from '@/features/posts/domain/errors';
import { LikePost } from '@/features/posts/domain/use-cases/like-post';
import { InvalidIdError } from '@/shared/domain/errors';
import { InMemoryPostLikeRepository } from './fake-post-like-repository';
import { InMemoryPostRepository, makePost } from './fake-post-repository';

describe('LikePost', () => {
    const setup = () => {
        const likes = new InMemoryPostLikeRepository();
        const useCase = new LikePost(new InMemoryPostRepository([makePost({ id: 1 })]), likes);
        return { likes, useCase };
    };

    it('likes the post for the user', async () => {
        const { likes, useCase } = setup();

        await useCase.execute({ postId: 1, userId: 'user-1' });

        expect(likes.likes.has('1:user-1')).toBe(true);
    });

    it('is idempotent: liking twice keeps a single like', async () => {
        const { likes, useCase } = setup();

        await useCase.execute({ postId: 1, userId: 'user-1' });
        await useCase.execute({ postId: 1, userId: 'user-1' });

        expect(likes.likes.size).toBe(1);
    });

    it('throws PostNotFoundError when the post does not exist', async () => {
        const { likes, useCase } = setup();

        await expect(useCase.execute({ postId: 2, userId: 'user-1' })).rejects.toBeInstanceOf(PostNotFoundError);
        expect(likes.likes.size).toBe(0);
    });

    it('throws InvalidIdError for an invalid post id', async () => {
        await expect(setup().useCase.execute({ postId: -1, userId: 'user-1' })).rejects.toBeInstanceOf(InvalidIdError);
    });
});
