export class CommentNotFoundError extends Error {
    constructor(readonly commentId: number) {
        super(`Comment ${commentId} not found`);
        this.name = 'CommentNotFoundError';
    }
}

export type InvalidCommentReason = 'empty' | 'too-long';

export class InvalidCommentContentError extends Error {
    constructor(readonly reason: InvalidCommentReason) {
        super(reason === 'empty' ? 'Comment cannot be empty' : 'Comment is too long');
        this.name = 'InvalidCommentContentError';
    }
}

// Only the author may edit or delete a comment; seeded comments have no registered author, so nobody can
export class NotCommentAuthorError extends Error {
    constructor(readonly commentId: number) {
        super(`You can only change your own comments (comment ${commentId})`);
        this.name = 'NotCommentAuthorError';
    }
}

export class InvalidAuthorIdError extends Error {
    constructor(readonly authorId: unknown) {
        super(`Invalid author id: ${String(authorId)}`);
        this.name = 'InvalidAuthorIdError';
    }
}
