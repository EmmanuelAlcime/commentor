import { getAvatar } from '@/features/profile/di';

// Serves a stored profile picture. URLs carry a version query, so a found picture may be cached for good.
export async function avatarResponse(userId: string): Promise<Response> {
    const avatar = await getAvatar(userId);
    if (!avatar) {
        return new Response(null, { status: 404, headers: { 'Cache-Control': 'no-store' } });
    }

    return new Response(new Uint8Array(avatar.data), {
        headers: {
            'Content-Type': avatar.contentType,
            'Content-Length': String(avatar.data.byteLength),
            'Cache-Control': 'public, max-age=31536000, immutable',
            'X-Content-Type-Options': 'nosniff',
        },
    });
}
