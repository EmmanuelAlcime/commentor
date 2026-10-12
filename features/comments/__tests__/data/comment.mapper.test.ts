import { describe, expect, it } from 'vitest';
import { type CommentViewRow, toComment, toCommentView, toStoredDate, UNKNOWN_AUTHOR } from '@/features/comments/data/comment.mapper';

const row = {
    id: 1,
    postId: 2,
    parentId: null,
    userId: 3,
    authorId: null,
    content: 'Great post!',
    createdAt: '2026-01-01T00:00:00.000Z',
    editedAt: null,
};

const viewRow = (overrides: Partial<CommentViewRow> = {}): CommentViewRow => ({
    ...row,
    authorName: null,
    legacyFirstName: 'Ada',
    legacyLastName: 'Lovelace',
    legacyUsername: 'ada.lovelace3',
    likeCount: 4,
    likedByViewer: true,
    ...overrides,
});

describe('toComment', () => {
    it('maps a row to a comment and parses createdAt', () => {
        expect(toComment(row)).toEqual({ ...row, createdAt: new Date('2026-01-01T00:00:00.000Z') });
    });

    it('keeps a missing createdAt as null', () => {
        expect(toComment({ ...row, createdAt: null }).createdAt).toBeNull();
    });

    it('keeps reply, author and edit fields', () => {
        const editedAt = new Date('2026-02-01T00:00:00.000Z');

        expect(toComment({ ...row, parentId: 9, authorId: 'user-1', userId: null, editedAt })).toMatchObject({
            parentId: 9,
            authorId: 'user-1',
            userId: null,
            editedAt,
        });
    });
});

describe('toCommentView', () => {
    it('uses the registered author’s name when there is one', () => {
        expect(toCommentView(viewRow({ authorId: 'user-1', authorName: 'Grace Hopper' })).authorName).toBe('Grace Hopper');
    });

    it('falls back to the seeded author’s full name', () => {
        expect(toCommentView(viewRow()).authorName).toBe('Ada Lovelace');
    });

    it('uses whichever part of the seeded name exists', () => {
        expect(toCommentView(viewRow({ legacyLastName: null })).authorName).toBe('Ada');
    });

    it('falls back to the seeded username when there is no name', () => {
        expect(toCommentView(viewRow({ legacyFirstName: null, legacyLastName: null })).authorName).toBe('ada.lovelace3');
    });

    it('shows an unknown author when no author can be found', () => {
        expect(
            toCommentView(viewRow({ legacyFirstName: null, legacyLastName: null, legacyUsername: null })).authorName,
        ).toBe(UNKNOWN_AUTHOR);
    });

    it('carries the like count and whether the viewer liked it, without the join columns', () => {
        const view = toCommentView(viewRow());

        expect(view).toMatchObject({ likeCount: 4, likedByViewer: true });
        expect(view).not.toHaveProperty('legacyFirstName');
    });
});

describe('toStoredDate', () => {
    it('stores dates as ISO strings like the seeded rows', () => {
        expect(toStoredDate(new Date('2026-03-04T05:06:07.000Z'))).toBe('2026-03-04T05:06:07.000Z');
    });
});
