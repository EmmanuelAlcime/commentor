import { describe, expect, it } from 'vitest';
import { toComment } from '@/features/comments/data/comment.mapper';

const row = {
    id: 1,
    postId: 2,
    userId: 3,
    content: 'Great post!',
    createdAt: '2026-01-01T00:00:00.000Z',
};

describe('toComment', () => {
    it('maps a row to a comment and parses createdAt', () => {
        expect(toComment(row)).toEqual({ ...row, createdAt: new Date('2026-01-01T00:00:00.000Z') });
    });

    it('keeps a missing createdAt as null', () => {
        expect(toComment({ ...row, createdAt: null }).createdAt).toBeNull();
    });
});
