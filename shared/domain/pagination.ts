export type Paginated<T> = {
    items: T[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
};

export class InvalidPageError extends Error {
    constructor(readonly page: unknown) {
        super(`Invalid page: ${String(page)}`);
        this.name = 'InvalidPageError';
    }
}
