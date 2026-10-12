import { describe, expect, it } from 'vitest';
import { safeCallbackURL } from '@/features/auth/presentation/callback-url';

describe('safeCallbackURL', () => {
    it.each(['/', '/my-post', '/?page=2'])('keeps the same-site path %s', (path) => {
        expect(safeCallbackURL(path)).toBe(path);
    });

    it.each([
        'https://evil.example',
        '//evil.example',
        '/\\evil.example',
        'my-post',
        '',
        undefined,
        ['/a', '/b'],
    ])('falls back to / for %o', (value) => {
        expect(safeCallbackURL(value)).toBe('/');
    });
});
