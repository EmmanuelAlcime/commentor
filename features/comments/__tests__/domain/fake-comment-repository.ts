import type { Comment, CommentView } from '@/features/comments/domain/entities/comment';
import type { CommentRepository, NewComment } from '@/features/comments/domain/repositories/comment-repository';

type Options = {
    // Posts that exist, for postExists()
    postIds?: number[];
    // Display names for registered authors, keyed by authorId
    authorNames?: Record<string, string>;
};

const likeKey = (commentId: number, userId: string) => `${commentId}:${userId}`;

export class InMemoryCommentRepository implements CommentRepository {
    readonly likes = new Set<string>();
    private readonly postIds: Set<number>;
    private readonly authorNames: Record<string, string>;
    private nextId: number;

    constructor(readonly comments: Comment[] = [], { postIds = [1], authorNames = {} }: Options = {}) {
        this.postIds = new Set(postIds);
        this.authorNames = authorNames;
        this.nextId = Math.max(0, ...comments.map((comment) => comment.id)) + 1;
    }

    async findById(id: number): Promise<Comment | null> {
        return this.comments.find((comment) => comment.id === id) ?? null;
    }

    async findByUserId(userId: number): Promise<Comment[]> {
        return this.comments.filter((comment) => comment.userId === userId);
    }

    async findViewsByPostId(postId: number, viewerId: string | null): Promise<CommentView[]> {
        return this.comments
            .filter((comment) => comment.postId === postId)
            .map((comment) => ({
                ...comment,
                authorName: (comment.authorId && this.authorNames[comment.authorId]) || 'Seeded user',
                likeCount: [...this.likes].filter((key) => key.startsWith(`${comment.id}:`)).length,
                likedByViewer: viewerId !== null && this.likes.has(likeKey(comment.id, viewerId)),
            }));
    }

    async postExists(postId: number): Promise<boolean> {
        return this.postIds.has(postId);
    }

    async create(comment: NewComment): Promise<Comment> {
        const created: Comment = { ...comment, id: this.nextId++, userId: null, editedAt: null };
        this.comments.push(created);
        return created;
    }

    async updateContent(id: number, content: string, editedAt: Date): Promise<void> {
        const comment = this.comments.find((candidate) => candidate.id === id);
        if (comment) Object.assign(comment, { content, editedAt });
    }

    async deleteThread(id: number): Promise<void> {
        const doomed = new Set([id]);
        // Keep sweeping until no comment points at a doomed parent, however deep the thread goes
        let grew = true;
        while (grew) {
            grew = false;
            for (const comment of this.comments) {
                if (comment.parentId !== null && doomed.has(comment.parentId) && !doomed.has(comment.id)) {
                    doomed.add(comment.id);
                    grew = true;
                }
            }
        }
        this.comments.splice(0, this.comments.length, ...this.comments.filter((comment) => !doomed.has(comment.id)));
        for (const key of [...this.likes]) {
            if (doomed.has(Number(key.split(':')[0]))) this.likes.delete(key);
        }
    }

    async addLike(commentId: number, userId: string): Promise<void> {
        this.likes.add(likeKey(commentId, userId));
    }

    async removeLike(commentId: number, userId: string): Promise<void> {
        this.likes.delete(likeKey(commentId, userId));
    }
}

export const makeComment = (overrides: Partial<Comment> = {}): Comment => ({
    id: 1,
    postId: 1,
    parentId: null,
    userId: 1,
    authorId: null,
    content: 'Great post!',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    editedAt: null,
    ...overrides,
});

export const makeCommentView = (overrides: Partial<CommentView> = {}): CommentView => ({
    ...makeComment(),
    authorName: 'Ada Lovelace',
    likeCount: 0,
    likedByViewer: false,
    ...overrides,
});
