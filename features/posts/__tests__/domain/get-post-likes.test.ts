import { describe, expect, it } from 'vitest';
import { GetPostLikes } from '@/features/posts/domain/use-cases/get-post-likes';
import { InvalidIdError } from '@/shared/domain/errors';
import { InMemoryPostLikeRepository } from './fake-post-like-repository';

describe('GetPostLikes', () => {
    const repository = () => {
        const likes = new InMemoryPostLikeRepository();
        likes.likes.add('1:user-1');
        likes.likes.add('1:user-2');
        likes.likes.add('2:user-1');
        return likes;
    };

    it('counts the post’s likes and says whether the viewer liked it', async () => {
        await expect(new GetPostLikes(repository()).execute(1, 'user-2')).resolves.toEqual({
            postId: 1,
            count: 2,
            likedByViewer: true,
        });
    });

    it('reports not liked when the viewer has not liked the post', async () => {
        await expect(new GetPostLikes(repository()).execute(2, 'user-2')).resolves.toMatchObject({
            count: 1,
            likedByViewer: false,
        });
    });

    it('reports not liked for a signed-out viewer', async () => {
        await expect(new GetPostLikes(repository()).execute(1, null)).resolves.toMatchObject({
            count: 2,
            likedByViewer: false,
        });
    });

    it('returns zero for a post with no likes', async () => {
        await expect(new GetPostLikes(repository()).execute(42, 'user-1')).resolves.toMatchObject({ count: 0 });
    });

    it('throws InvalidIdError for an invalid post id', async () => {
        await expect(new GetPostLikes(repository()).execute(0, null)).rejects.toBeInstanceOf(InvalidIdError);
    });
});
