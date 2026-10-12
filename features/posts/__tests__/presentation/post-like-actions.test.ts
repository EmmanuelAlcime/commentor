import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PostNotFoundError } from '@/features/posts/domain/errors';

const auth = vi.hoisted(() => ({ getCurrentUser: vi.fn() }));
const posts = vi.hoisted(() => ({ likePost: vi.fn(), unlikePost: vi.fn() }));
const refresh = vi.hoisted(() => vi.fn());
// redirect() throws in Next.js to stop the action; mirror that so code after it never runs
const redirect = vi.hoisted(() =>
    vi.fn((url: string) => {
        throw new Error(`NEXT_REDIRECT:${url}`);
    }),
);

vi.mock('@/features/auth/di', () => auth);
vi.mock('@/features/posts/di', () => posts);
vi.mock('next/cache', () => ({ refresh }));
vi.mock('next/navigation', () => ({ redirect }));

const { setPostLikeAction } = await import('@/features/posts/presentation/actions/post-like-actions');

describe('setPostLikeAction', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        auth.getCurrentUser.mockResolvedValue({ id: 'user-1', name: 'Ada', email: 'ada@example.com', image: null });
    });

    it('likes the post as the signed-in user and refreshes the page', async () => {
        await setPostLikeAction(3, true);

        expect(posts.likePost).toHaveBeenCalledWith({ postId: 3, userId: 'user-1' });
        expect(posts.unlikePost).not.toHaveBeenCalled();
        expect(refresh).toHaveBeenCalledOnce();
    });

    it('unlikes the post', async () => {
        await setPostLikeAction(3, false);

        expect(posts.unlikePost).toHaveBeenCalledWith({ postId: 3, userId: 'user-1' });
        expect(posts.likePost).not.toHaveBeenCalled();
    });

    it('sends a signed-out user to log in', async () => {
        auth.getCurrentUser.mockResolvedValue(null);

        await expect(setPostLikeAction(3, true)).rejects.toThrow('NEXT_REDIRECT:/login');
        expect(posts.likePost).not.toHaveBeenCalled();
    });

    it.each([
        ['3', true],
        [3, 'true'],
        [null, false],
    ])('rejects malformed input (%j, %j)', async (postId, liked) => {
        await expect(setPostLikeAction(postId, liked)).rejects.toThrow('Invalid like request');
        expect(posts.likePost).not.toHaveBeenCalled();
        expect(posts.unlikePost).not.toHaveBeenCalled();
    });

    it('lets domain errors such as a missing post surface', async () => {
        posts.likePost.mockRejectedValue(new PostNotFoundError(3));

        await expect(setPostLikeAction(3, true)).rejects.toBeInstanceOf(PostNotFoundError);
        expect(refresh).not.toHaveBeenCalled();
    });
});
