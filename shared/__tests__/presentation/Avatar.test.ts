import { describe, expect, it } from 'vitest';
import { initials } from '@/shared/presentation/components/ui/Avatar';

describe('initials', () => {
    it('uses the first letters of the first and last words', () => {
        expect(initials('Ada King Lovelace')).toBe('AL');
    });

    it('uses one letter for a single word', () => {
        expect(initials('ada.lovelace3')).toBe('A');
    });

    it('ignores extra whitespace', () => {
        expect(initials('  grace   hopper ')).toBe('GH');
    });

    it('falls back to a question mark for an empty name', () => {
        expect(initials('   ')).toBe('?');
    });
});
