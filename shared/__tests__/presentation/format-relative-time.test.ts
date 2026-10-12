import { describe, expect, it } from 'vitest';
import { formatRelativeTime } from '@/shared/presentation/format-relative-time';

const now = new Date('2026-10-12T12:00:00.000Z');
const ago = (ms: number) => new Date(now.getTime() - ms);
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe('formatRelativeTime', () => {
    it.each([
        [0, 'now'],
        [59_999, 'now'],
        [MINUTE, '1m'],
        [15 * MINUTE, '15m'],
        [HOUR - 1, '59m'],
        [HOUR, '1h'],
        [23 * HOUR, '23h'],
        [DAY, '1d'],
        [6 * DAY, '6d'],
        [7 * DAY, '1w'],
        [34 * DAY, '4w'],
    ])('formats %i ms ago as %s', (elapsed, expected) => {
        expect(formatRelativeTime(ago(elapsed), now)).toBe(expected);
    });

    it('shows month and day for older dates in the same year', () => {
        expect(formatRelativeTime(new Date('2026-01-04T12:00:00.000Z'), now)).toBe('Jan 4');
    });

    it('includes the year for dates in another year', () => {
        expect(formatRelativeTime(new Date('2025-06-04T12:00:00.000Z'), now)).toBe('Jun 4, 2025');
    });

    it('treats dates slightly in the future (clock skew) as now', () => {
        expect(formatRelativeTime(new Date(now.getTime() + 5_000), now)).toBe('now');
    });
});
