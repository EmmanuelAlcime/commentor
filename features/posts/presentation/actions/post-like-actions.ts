'use server';

import { refresh } from 'next/cache';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/features/auth/di';
import { likePost, unlikePost } from '@/features/posts/di';

// Called from the like button; both arguments come from the client, so they are checked here
export async function setPostLikeAction(postId: unknown, liked: unknown): Promise<void> {
    const user = await getCurrentUser();
    if (!user) redirect('/login');

    if (typeof postId !== 'number' || typeof liked !== 'boolean') {
        throw new Error('Invalid like request');
    }

    if (liked) {
        await likePost({ postId, userId: user.id });
    } else {
        await unlikePost({ postId, userId: user.id });
    }

    refresh();
}
