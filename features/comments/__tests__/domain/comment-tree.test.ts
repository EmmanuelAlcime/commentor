import { describe, expect, it } from 'vitest';
import { buildCommentTree, type CommentNode, countComments } from '@/features/comments/domain/entities/comment-tree';
import { makeCommentView } from './fake-comment-repository';

const at = (day: number) => new Date(`2026-01-${String(day).padStart(2, '0')}T00:00:00.000Z`);
const ids = (nodes: CommentNode[]) => nodes.map((node) => node.id);

describe('buildCommentTree', () => {
    it('returns an empty tree for no comments', () => {
        expect(buildCommentTree([], 'newest')).toEqual([]);
    });

    it('nests replies under their parent at any depth', () => {
        const tree = buildCommentTree(
            [
                makeCommentView({ id: 1 }),
                makeCommentView({ id: 2, parentId: 1 }),
                makeCommentView({ id: 3, parentId: 2 }),
                makeCommentView({ id: 4, parentId: 3 }),
            ],
            'newest',
        );

        expect(ids(tree)).toEqual([1]);
        expect(ids(tree[0].replies)).toEqual([2]);
        expect(ids(tree[0].replies[0].replies)).toEqual([3]);
        expect(ids(tree[0].replies[0].replies[0].replies)).toEqual([4]);
    });

    it('counts every reply below a comment, not just direct ones', () => {
        const tree = buildCommentTree(
            [
                makeCommentView({ id: 1 }),
                makeCommentView({ id: 2, parentId: 1 }),
                makeCommentView({ id: 3, parentId: 2 }),
                makeCommentView({ id: 4, parentId: 1 }),
            ],
            'newest',
        );

        expect(tree[0].replyCount).toBe(3);
        expect(tree[0].replies.find((node) => node.id === 2)?.replyCount).toBe(1);
        expect(tree[0].replies.find((node) => node.id === 4)?.replyCount).toBe(0);
    });

    it('sorts top-level comments newest first, breaking ties by id', () => {
        const tree = buildCommentTree(
            [
                makeCommentView({ id: 1, createdAt: at(1) }),
                makeCommentView({ id: 2, createdAt: at(3) }),
                makeCommentView({ id: 3, createdAt: at(2) }),
                makeCommentView({ id: 4, createdAt: at(2) }),
            ],
            'newest',
        );

        expect(ids(tree)).toEqual([2, 4, 3, 1]);
    });

    it('sorts top-level comments by likes for "top", then newest first', () => {
        const tree = buildCommentTree(
            [
                makeCommentView({ id: 1, likeCount: 2, createdAt: at(1) }),
                makeCommentView({ id: 2, likeCount: 5, createdAt: at(2) }),
                makeCommentView({ id: 3, likeCount: 2, createdAt: at(3) }),
            ],
            'top',
        );

        expect(ids(tree)).toEqual([2, 3, 1]);
    });

    it('keeps replies oldest first whatever the top-level sort', () => {
        const comments = [
            makeCommentView({ id: 1 }),
            makeCommentView({ id: 2, parentId: 1, createdAt: at(3), likeCount: 9 }),
            makeCommentView({ id: 3, parentId: 1, createdAt: at(2) }),
        ];

        expect(ids(buildCommentTree(comments, 'newest')[0].replies)).toEqual([3, 2]);
        expect(ids(buildCommentTree(comments, 'top')[0].replies)).toEqual([3, 2]);
    });

    it('places comments without a date last when sorting newest first', () => {
        const tree = buildCommentTree(
            [makeCommentView({ id: 1, createdAt: null }), makeCommentView({ id: 2, createdAt: at(1) })],
            'newest',
        );

        expect(ids(tree)).toEqual([2, 1]);
    });

    it('drops a reply whose parent is missing, along with its own replies', () => {
        const tree = buildCommentTree(
            [
                makeCommentView({ id: 1 }),
                makeCommentView({ id: 2, parentId: 99 }),
                makeCommentView({ id: 3, parentId: 2 }),
            ],
            'newest',
        );

        expect(ids(tree)).toEqual([1]);
        expect(countComments(tree)).toBe(1);
    });

    it('does not mutate the input comments', () => {
        const parent = makeCommentView({ id: 1 });
        buildCommentTree([parent, makeCommentView({ id: 2, parentId: 1 })], 'newest');

        expect(parent).not.toHaveProperty('replies');
    });
});

describe('countComments', () => {
    it('counts top-level comments and all replies', () => {
        const tree = buildCommentTree(
            [
                makeCommentView({ id: 1 }),
                makeCommentView({ id: 2, parentId: 1 }),
                makeCommentView({ id: 3, parentId: 2 }),
                makeCommentView({ id: 4 }),
            ],
            'newest',
        );

        expect(countComments(tree)).toBe(4);
    });

    it('is zero for an empty tree', () => {
        expect(countComments([])).toBe(0);
    });
});
