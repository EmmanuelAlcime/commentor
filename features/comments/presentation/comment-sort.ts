import { COMMENT_SORTS, type CommentSort } from '@/features/comments/domain/entities/comment';

export const DEFAULT_COMMENT_SORT: CommentSort = 'newest';

// Reads ?sort= from the URL; anything unexpected falls back to the default
export function parseCommentSort(value: unknown): CommentSort {
    return COMMENT_SORTS.find((sort) => sort === value) ?? DEFAULT_COMMENT_SORT;
}
