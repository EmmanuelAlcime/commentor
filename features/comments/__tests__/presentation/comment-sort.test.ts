import { describe, expect, it } from 'vitest';
import { DEFAULT_COMMENT_SORT, parseCommentSort } from '@/features/comments/presentation/comment-sort';

describe('parseCommentSort', () => {
    it.each(['newest', 'top'] as const)('accepts %s', (sort) => {
        expect(parseCommentSort(sort)).toBe(sort);
    });

    it.each([undefined, '', 'oldest', 'TOP', ['top'], 42])('falls back to the default for %j', (value) => {
        expect(parseCommentSort(value)).toBe(DEFAULT_COMMENT_SORT);
    });

    it('defaults to newest first', () => {
        expect(DEFAULT_COMMENT_SORT).toBe('newest');
    });
});
