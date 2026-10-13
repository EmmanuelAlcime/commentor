import { describe, expect, it } from 'vitest';
import { isPostSort, normalizeSearch, SEARCH_MAX_LENGTH } from '@/features/posts/domain/entities/post-query';

describe('normalizeSearch', () => {
    it('trims and collapses whitespace', () => {
        expect(normalizeSearch('  hello    world \n')).toBe('hello world');
    });

    it('returns an empty string for blank input', () => {
        expect(normalizeSearch('   ')).toBe('');
    });

    it('caps the length and does not leave a trailing space', () => {
        const long = `${'a'.repeat(SEARCH_MAX_LENGTH - 1)} bcd`;
        const result = normalizeSearch(long);

        expect(result.length).toBeLessThanOrEqual(SEARCH_MAX_LENGTH);
        expect(result).toBe('a'.repeat(SEARCH_MAX_LENGTH - 1));
    });
});

describe('isPostSort', () => {
    it.each(['newest', 'oldest'])('accepts %s', (value) => {
        expect(isPostSort(value)).toBe(true);
    });

    it.each(['top', 'NEWEST', '', undefined, 1])('rejects %j', (value) => {
        expect(isPostSort(value)).toBe(false);
    });
});
