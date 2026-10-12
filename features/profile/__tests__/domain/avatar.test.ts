import { describe, expect, it } from 'vitest';
import { avatarUrl, detectImageType } from '@/features/profile/domain/entities/avatar';
import { GIF_BYTES, JPEG_BYTES, PNG_BYTES, WEBP_BYTES } from './fake-profile-repository';

describe('detectImageType', () => {
    it.each([
        ['image/png', PNG_BYTES],
        ['image/jpeg', JPEG_BYTES],
        ['image/gif', GIF_BYTES],
        ['image/webp', WEBP_BYTES],
    ])('recognises %s from its signature', (type, bytes) => {
        expect(detectImageType(bytes)).toBe(type);
    });

    it('rejects a GIF with an unknown version', () => {
        const bytes = new Uint8Array(GIF_BYTES);
        bytes[4] = 0x38;
        expect(detectImageType(bytes)).toBeNull();
    });

    it('rejects a RIFF container that is not WebP', () => {
        const bytes = new Uint8Array(WEBP_BYTES);
        bytes[8] = 0x41; // "AVI "
        expect(detectImageType(bytes)).toBeNull();
    });

    it('rejects text, SVG and empty input', () => {
        expect(detectImageType(new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"/>'))).toBeNull();
        expect(detectImageType(new TextEncoder().encode('hello'))).toBeNull();
        expect(detectImageType(new Uint8Array())).toBeNull();
    });

    it('rejects a truncated signature', () => {
        expect(detectImageType(PNG_BYTES.slice(0, 4))).toBeNull();
    });
});

describe('avatarUrl', () => {
    it('points at the avatar route, versioned by the upload time', () => {
        expect(avatarUrl('user-1', new Date(1_700_000_000_000))).toBe('/api/avatars/user-1?v=1700000000000');
    });

    it('escapes the user id', () => {
        expect(avatarUrl('a/b?c', new Date(0))).toBe('/api/avatars/a%2Fb%3Fc?v=0');
    });
});
