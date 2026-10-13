import { describe, expect, it } from 'vitest';
import { toSearchPattern } from '@/features/posts/data/post.mapper';

describe('toSearchPattern', () => {
    it('wraps the term for a contains match', () => {
        expect(toSearchPattern('react')).toBe('%react%');
    });

    it('escapes LIKE wildcards and backslashes so they match literally', () => {
        expect(toSearchPattern('100%_done\\')).toBe('%100\\%\\_done\\\\%');
    });
});
