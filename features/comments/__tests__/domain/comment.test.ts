import { describe, expect, it } from 'vitest';
import { COMMENT_MAX_LENGTH, isCommentAuthor, validateCommentContent } from '@/features/comments/domain/entities/comment';
import { InvalidCommentContentError } from '@/features/comments/domain/errors';

describe('validateCommentContent', () => {
    it('returns the content trimmed', () => {
        expect(validateCommentContent('  Nice post!  \n')).toBe('Nice post!');
    });

    it.each(['', '   ', '\n\t'])('rejects empty content %j', (content) => {
        expect(() => validateCommentContent(content)).toThrow(expect.objectContaining({ reason: 'empty' }));
    });

    it('accepts content at exactly the maximum length', () => {
        const content = 'a'.repeat(COMMENT_MAX_LENGTH);
        expect(validateCommentContent(content)).toBe(content);
    });

    it('rejects content longer than the maximum', () => {
        expect(() => validateCommentContent('a'.repeat(COMMENT_MAX_LENGTH + 1))).toThrow(InvalidCommentContentError);
        expect(() => validateCommentContent('a'.repeat(COMMENT_MAX_LENGTH + 1))).toThrow(
            expect.objectContaining({ reason: 'too-long' }),
        );
    });

    it('measures the length after trimming', () => {
        const content = `  ${'a'.repeat(COMMENT_MAX_LENGTH)}  `;
        expect(validateCommentContent(content)).toHaveLength(COMMENT_MAX_LENGTH);
    });
});

describe('isCommentAuthor', () => {
    it('is true for the registered author', () => {
        expect(isCommentAuthor({ authorId: 'user-1' }, 'user-1')).toBe(true);
    });

    it('is false for anyone else', () => {
        expect(isCommentAuthor({ authorId: 'user-1' }, 'user-2')).toBe(false);
    });

    it('is false for seeded comments, which have no registered author', () => {
        expect(isCommentAuthor({ authorId: null }, 'user-1')).toBe(false);
    });
});
