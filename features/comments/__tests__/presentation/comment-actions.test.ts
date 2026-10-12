import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    CommentNotFoundError,
    InvalidCommentContentError,
    NotCommentAuthorError,
} from '@/features/comments/domain/errors';
import { initialCommentFormState } from '@/features/comments/presentation/actions/comment-action-state';
import { PostNotFoundError } from '@/features/posts/domain/errors';
import { InvalidIdError } from '@/shared/domain/errors';

const auth = vi.hoisted(() => ({ getCurrentUser: vi.fn() }));
const comments = vi.hoisted(() => ({
    createComment: vi.fn(),
    replyToComment: vi.fn(),
    editComment: vi.fn(),
    deleteComment: vi.fn(),
    likeComment: vi.fn(),
    unlikeComment: vi.fn(),
}));
const refresh = vi.hoisted(() => vi.fn());
const updateTag = vi.hoisted(() => vi.fn());
// redirect() throws in Next.js to stop the action; mirror that so code after it never runs
const redirect = vi.hoisted(() =>
    vi.fn((url: string) => {
        throw new Error(`NEXT_REDIRECT:${url}`);
    }),
);

vi.mock('@/features/auth/di', () => auth);
vi.mock('@/features/comments/di', () => comments);
vi.mock('next/cache', () => ({ refresh, updateTag }));
vi.mock('next/navigation', () => ({ redirect }));

const {
    createCommentAction,
    replyToCommentAction,
    editCommentAction,
    deleteCommentAction,
    setCommentLikeAction,
} = await import('@/features/comments/presentation/actions/comment-actions');

const form = (content: string | null) => {
    const formData = new FormData();
    if (content !== null) formData.set('content', content);
    return formData;
};

const signedIn = () => auth.getCurrentUser.mockResolvedValue({ id: 'user-1', name: 'Ada', email: 'ada@example.com', image: null });

describe('comment actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        signedIn();
    });

    describe('createCommentAction', () => {
        it('creates the comment as the signed-in user and refreshes the page', async () => {
            const state = await createCommentAction(3, initialCommentFormState, form('Hello'));

            expect(comments.createComment).toHaveBeenCalledWith({ postId: 3, authorId: 'user-1', content: 'Hello' });
            expect(refresh).toHaveBeenCalledOnce();
            expect(updateTag).toHaveBeenCalledWith('comments');
            expect(state).toMatchObject({ status: 'success' });
        });

        it('treats a missing content field as empty', async () => {
            await createCommentAction(3, initialCommentFormState, form(null));

            expect(comments.createComment).toHaveBeenCalledWith(expect.objectContaining({ content: '' }));
        });

        it('asks a signed-out user to log in and creates nothing', async () => {
            auth.getCurrentUser.mockResolvedValue(null);

            const state = await createCommentAction(3, initialCommentFormState, form('Hello'));

            expect(state).toEqual({ status: 'error', error: 'Log in to comment.', content: 'Hello' });
            expect(comments.createComment).not.toHaveBeenCalled();
            expect(refresh).not.toHaveBeenCalled();
        });

        it('explains empty content and keeps what was typed', async () => {
            comments.createComment.mockRejectedValue(new InvalidCommentContentError('empty'));

            const state = await createCommentAction(3, initialCommentFormState, form('   '));

            expect(state).toEqual({ status: 'error', error: 'Write something before posting.', content: '   ' });
            expect(refresh).not.toHaveBeenCalled();
            expect(updateTag).not.toHaveBeenCalled();
        });

        it('explains content that is too long', async () => {
            comments.createComment.mockRejectedValue(new InvalidCommentContentError('too-long'));

            const state = await createCommentAction(3, initialCommentFormState, form('long'));

            expect(state).toMatchObject({ status: 'error', error: expect.stringContaining('at most') });
        });

        it('explains that the post is gone', async () => {
            comments.createComment.mockRejectedValue(new PostNotFoundError(3));

            await expect(createCommentAction(3, initialCommentFormState, form('Hi'))).resolves.toMatchObject({
                error: 'This post no longer exists.',
            });
        });

        it('handles a tampered post id without crashing', async () => {
            comments.createComment.mockRejectedValue(new InvalidIdError('abc'));

            await expect(createCommentAction(3, initialCommentFormState, form('Hi'))).resolves.toMatchObject({
                status: 'error',
            });
        });

        it('rethrows unexpected errors', async () => {
            comments.createComment.mockRejectedValue(new Error('database down'));

            await expect(createCommentAction(3, initialCommentFormState, form('Hi'))).rejects.toThrow('database down');
        });
    });

    describe('replyToCommentAction', () => {
        it('replies as the signed-in user and refreshes the page', async () => {
            const state = await replyToCommentAction(9, initialCommentFormState, form('Agreed'));

            expect(comments.replyToComment).toHaveBeenCalledWith({ parentId: 9, authorId: 'user-1', content: 'Agreed' });
            expect(refresh).toHaveBeenCalledOnce();
            expect(state).toMatchObject({ status: 'success' });
        });

        it('explains that the comment being replied to is gone', async () => {
            comments.replyToComment.mockRejectedValue(new CommentNotFoundError(9));

            await expect(replyToCommentAction(9, initialCommentFormState, form('Hi'))).resolves.toMatchObject({
                error: 'This comment no longer exists.',
            });
        });
    });

    describe('editCommentAction', () => {
        it('edits as the signed-in user and refreshes the page', async () => {
            const state = await editCommentAction(4, initialCommentFormState, form('Updated'));

            expect(comments.editComment).toHaveBeenCalledWith({ commentId: 4, userId: 'user-1', content: 'Updated' });
            expect(state).toMatchObject({ status: 'success' });
        });

        it('refuses to edit someone else’s comment', async () => {
            comments.editComment.mockRejectedValue(new NotCommentAuthorError(4));

            await expect(editCommentAction(4, initialCommentFormState, form('Hijack'))).resolves.toMatchObject({
                error: 'You can only change your own comments.',
            });
            expect(refresh).not.toHaveBeenCalled();
        });
    });

    describe('deleteCommentAction', () => {
        it('deletes as the signed-in user and refreshes the page', async () => {
            await expect(deleteCommentAction(4)).resolves.toEqual({ ok: true });

            expect(comments.deleteComment).toHaveBeenCalledWith({ commentId: 4, userId: 'user-1' });
            expect(refresh).toHaveBeenCalledOnce();
            expect(updateTag).toHaveBeenCalledWith('comments');
        });

        it('refuses a signed-out user', async () => {
            auth.getCurrentUser.mockResolvedValue(null);

            await expect(deleteCommentAction(4)).resolves.toMatchObject({ ok: false });
            expect(comments.deleteComment).not.toHaveBeenCalled();
        });

        it('refuses to delete someone else’s comment', async () => {
            comments.deleteComment.mockRejectedValue(new NotCommentAuthorError(4));

            await expect(deleteCommentAction(4)).resolves.toEqual({
                ok: false,
                error: 'You can only change your own comments.',
            });
            expect(refresh).not.toHaveBeenCalled();
        });

        it('rethrows unexpected errors', async () => {
            comments.deleteComment.mockRejectedValue(new Error('database down'));

            await expect(deleteCommentAction(4)).rejects.toThrow('database down');
        });
    });

    describe('setCommentLikeAction', () => {
        it('likes the comment and refreshes the page', async () => {
            await setCommentLikeAction(4, true);

            expect(comments.likeComment).toHaveBeenCalledWith({ commentId: 4, userId: 'user-1' });
            expect(comments.unlikeComment).not.toHaveBeenCalled();
            expect(refresh).toHaveBeenCalledOnce();
            expect(updateTag).toHaveBeenCalledWith('comments');
        });

        it('unlikes the comment', async () => {
            await setCommentLikeAction(4, false);

            expect(comments.unlikeComment).toHaveBeenCalledWith({ commentId: 4, userId: 'user-1' });
            expect(comments.likeComment).not.toHaveBeenCalled();
        });

        it('sends a signed-out user to log in', async () => {
            auth.getCurrentUser.mockResolvedValue(null);

            await expect(setCommentLikeAction(4, true)).rejects.toThrow('NEXT_REDIRECT:/login');
            expect(comments.likeComment).not.toHaveBeenCalled();
        });

        it('rejects a non-boolean like value', async () => {
            await expect(setCommentLikeAction(4, 'yes')).rejects.toThrow('Invalid like request');
            expect(comments.likeComment).not.toHaveBeenCalled();
        });

        it('quietly refreshes when the comment was deleted meanwhile', async () => {
            comments.likeComment.mockRejectedValue(new CommentNotFoundError(4));

            await expect(setCommentLikeAction(4, true)).resolves.toBeUndefined();
            expect(refresh).toHaveBeenCalledOnce();
        });

        it('rethrows unexpected errors', async () => {
            comments.likeComment.mockRejectedValue(new Error('database down'));

            await expect(setCommentLikeAction(4, true)).rejects.toThrow('database down');
        });
    });
});
