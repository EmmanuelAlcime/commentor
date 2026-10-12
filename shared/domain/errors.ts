export class InvalidIdError extends Error {
    constructor(readonly id: unknown) {
        super(`Invalid id: ${String(id)}`);
        this.name = 'InvalidIdError';
    }
}

export function assertValidId(id: number): void {
    if (!Number.isInteger(id) || id < 1) {
        throw new InvalidIdError(id);
    }
}
