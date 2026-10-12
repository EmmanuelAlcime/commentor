import { describe, expect, it } from 'vitest';
import { toPost } from '@/features/posts/data/post.mapper';

const row = {
    id: 1,
    title: 'Hello World',
    content: 'First post',
    slug: 'hello-world-1',
    image: null,
    date: '2026-01-01',
    createdAt: '2026-01-01T00:00:00.000Z',
};

describe('toPost', () => {
    it('maps a row to a post and parses createdAt', () => {
        expect(toPost(row)).toEqual({ ...row, createdAt: new Date('2026-01-01T00:00:00.000Z') });
    });

    it('keeps a missing createdAt as null', () => {
        expect(toPost({ ...row, createdAt: null }).createdAt).toBeNull();
    });
});
