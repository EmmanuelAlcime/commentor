export class UserNotFoundError extends Error {
    constructor(readonly userId: number) {
        super(`User ${userId} not found`);
        this.name = 'UserNotFoundError';
    }
}
