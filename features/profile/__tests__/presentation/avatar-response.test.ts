import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeAvatar, PNG_BYTES } from '../domain/fake-profile-repository';

const di = vi.hoisted(() => ({ getAvatar: vi.fn() }));
vi.mock('@/features/profile/di', () => di);

const { avatarResponse } = await import('@/features/profile/presentation/avatar-response');

beforeEach(() => {
    vi.clearAllMocks();
});

describe('avatarResponse', () => {
    it('serves the picture with its content type and long-lived caching', async () => {
        di.getAvatar.mockResolvedValue(makeAvatar());

        const response = await avatarResponse('user-1');

        expect(di.getAvatar).toHaveBeenCalledWith('user-1');
        expect(response.status).toBe(200);
        expect(response.headers.get('Content-Type')).toBe('image/png');
        expect(response.headers.get('Content-Length')).toBe(String(PNG_BYTES.byteLength));
        expect(response.headers.get('Cache-Control')).toContain('immutable');
        expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
        expect(new Uint8Array(await response.arrayBuffer())).toEqual(PNG_BYTES);
    });

    it('returns an uncached 404 when there is no picture', async () => {
        di.getAvatar.mockResolvedValue(null);

        const response = await avatarResponse('user-2');

        expect(response.status).toBe(404);
        expect(response.headers.get('Cache-Control')).toBe('no-store');
    });
});
