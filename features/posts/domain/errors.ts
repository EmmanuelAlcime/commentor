export class PostNotFoundError extends Error {
    constructor(readonly identifier: number | string) {
        super(`Post ${identifier} not found`);
        this.name = 'PostNotFoundError';
    }
}
