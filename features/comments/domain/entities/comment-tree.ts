import type { CommentSort, CommentView } from './comment';

export type CommentNode = CommentView & {
    replies: CommentNode[];
    // Every reply below this comment, at any depth
    replyCount: number;
};

const time = (date: Date | null) => date?.getTime() ?? 0;

const newestFirst = (a: CommentNode, b: CommentNode) => time(b.createdAt) - time(a.createdAt) || b.id - a.id;
const oldestFirst = (a: CommentNode, b: CommentNode) => time(a.createdAt) - time(b.createdAt) || a.id - b.id;
const mostLikedFirst = (a: CommentNode, b: CommentNode) => b.likeCount - a.likeCount || newestFirst(a, b);

const topLevelOrder: Record<CommentSort, (a: CommentNode, b: CommentNode) => number> = {
    newest: newestFirst,
    top: mostLikedFirst,
};

// Replies read as a conversation, so they stay oldest first whatever the top-level sort is
function finalize(node: CommentNode): number {
    node.replies.sort(oldestFirst);
    node.replyCount = node.replies.reduce((total, reply) => total + 1 + finalize(reply), 0);
    return node.replyCount;
}

// Nests a flat list of comments under their parents. A reply whose parent is missing (for example
// because its author's account was deleted) is dropped together with its own replies.
export function buildCommentTree(comments: CommentView[], sort: CommentSort): CommentNode[] {
    const nodes = new Map<number, CommentNode>(comments.map((comment) => [comment.id, { ...comment, replies: [], replyCount: 0 }]));
    const roots: CommentNode[] = [];

    for (const node of nodes.values()) {
        if (node.parentId === null) {
            roots.push(node);
        } else {
            nodes.get(node.parentId)?.replies.push(node);
        }
    }

    roots.forEach(finalize);
    return roots.sort(topLevelOrder[sort]);
}

export const countComments = (tree: CommentNode[]): number =>
    tree.reduce((total, node) => total + 1 + node.replyCount, 0);
