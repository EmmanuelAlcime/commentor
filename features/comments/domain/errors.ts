export class CommentNotFoundError extends Error {
    constructor(readonly commentId: number) {
        super(`Comment ${commentId} not found`);
        this.name = 'CommentNotFoundError';
    }
}
