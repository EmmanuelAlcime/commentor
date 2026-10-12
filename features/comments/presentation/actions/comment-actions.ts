'use server';

import { refresh } from 'next/cache';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/features/auth/di';
import {
    createComment,
    deleteComment,
    editComment,
    likeComment,
    replyToComment,
    unlikeComment,
} from '@/features/comments/di';
import { COMMENT_MAX_LENGTH } from '@/features/comments/domain/entities/comment';
import {
    CommentNotFoundError,
    InvalidCommentContentError,
    NotCommentAuthorError,
} from '@/features/comments/domain/errors';
import { PostNotFoundError } from '@/features/posts/domain/errors';
import { InvalidIdError } from '@/shared/domain/errors';
import type { CommentActionResult, CommentFormState } from './comment-action-state';

// Ids are bound on the client, so they can be anything; the use cases reject what isn't a valid id

const contentOf = (formData: FormData) => {
    const value = formData.get('content');
    return typeof value === 'string' ? value : '';
};

// Turns expected domain errors into a message for the user; anything else is a bug and is rethrown
function errorMessage(error: unknown): string | null {
    if (error instanceof InvalidCommentContentError) {
        return error.reason === 'empty'
            ? 'Write something before posting.'
            : `Comments can be at most ${COMMENT_MAX_LENGTH} characters.`;
    }
    if (error instanceof NotCommentAuthorError) return 'You can only change your own comments.';
    if (error instanceof CommentNotFoundError) return 'This comment no longer exists.';
    if (error instanceof PostNotFoundError) return 'This post no longer exists.';
    if (error instanceof InvalidIdError) return 'Something went wrong. Refresh the page and try again.';
    return null;
}

async function submit(content: string, mutate: (userId: string) => Promise<unknown>): Promise<CommentFormState> {
    const user = await getCurrentUser();
    if (!user) return { status: 'error', error: 'Log in to comment.', content };

    try {
        await mutate(user.id);
    } catch (error) {
        const message = errorMessage(error);
        if (message) return { status: 'error', error: message, content };
        throw error;
    }

    refresh();
    return { status: 'success', at: Date.now() };
}

export async function createCommentAction(postId: number, _previous: CommentFormState, formData: FormData): Promise<CommentFormState> {
    const content = contentOf(formData);
    return submit(content, (userId) => createComment({ postId, authorId: userId, content }));
}

export async function replyToCommentAction(parentId: number, _previous: CommentFormState, formData: FormData): Promise<CommentFormState> {
    const content = contentOf(formData);
    return submit(content, (userId) => replyToComment({ parentId, authorId: userId, content }));
}

export async function editCommentAction(commentId: number, _previous: CommentFormState, formData: FormData): Promise<CommentFormState> {
    const content = contentOf(formData);
    return submit(content, (userId) => editComment({ commentId, userId, content }));
}

export async function deleteCommentAction(commentId: number): Promise<CommentActionResult> {
    const user = await getCurrentUser();
    if (!user) return { ok: false, error: 'Log in to delete your comments.' };

    try {
        await deleteComment({ commentId, userId: user.id });
    } catch (error) {
        const message = errorMessage(error);
        if (message) return { ok: false, error: message };
        throw error;
    }

    refresh();
    return { ok: true };
}

export async function setCommentLikeAction(commentId: number, liked: unknown): Promise<void> {
    const user = await getCurrentUser();
    if (!user) redirect('/login');

    if (typeof liked !== 'boolean') {
        throw new Error('Invalid like request');
    }

    try {
        if (liked) {
            await likeComment({ commentId, userId: user.id });
        } else {
            await unlikeComment({ commentId, userId: user.id });
        }
    } catch (error) {
        // Liking a comment that was deleted meanwhile: the refresh below simply removes it from the page
        if (!(error instanceof CommentNotFoundError)) throw error;
    }

    refresh();
}
