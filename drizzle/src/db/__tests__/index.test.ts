import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Keep the real .env out of these tests so the environment is exactly what each test sets
vi.mock('dotenv/config', () => ({}));

const originalEnv = { ...process.env };
const DATABASE_KEYS = ['DATABASE_HOST', 'DATABASE_PORT', 'DATABASE_USERNAME', 'DATABASE_PASSWORD', 'DATABASE_NAME', 'DATABASE_SSL'];

const createPool = vi.fn(() => ({ kind: 'pool' }));
const drizzle = vi.fn(() => ({
    select: vi.fn(function (this: unknown) { return this; }),
    insert: vi.fn(),
    marker: 'database',
}));

beforeEach(() => {
    vi.resetModules();
    createPool.mockClear();
    drizzle.mockClear();
    for (const key of DATABASE_KEYS) delete process.env[key];
    vi.doMock('mysql2', () => ({ default: { createPool } }));
    vi.doMock('drizzle-orm/mysql2', () => ({ drizzle }));
});

afterEach(() => {
    process.env = { ...originalEnv };
    vi.doUnmock('mysql2');
    vi.doUnmock('drizzle-orm/mysql2');
});

describe('db', () => {
    it('can be imported without database credentials, as during `next build`', async () => {
        await expect(import('../index')).resolves.toHaveProperty('db');
        expect(createPool).not.toHaveBeenCalled();
        expect(drizzle).not.toHaveBeenCalled();
    });

    it('throws a clear error on first use when DATABASE_HOST is missing', async () => {
        const { db } = await import('../index');

        expect(() => db.select).toThrow('DATABASE_HOST is not set');
    });

    it('creates the client once, from the environment, on first use', async () => {
        process.env.DATABASE_HOST = 'db.example.com';
        process.env.DATABASE_PORT = '4000';
        process.env.DATABASE_SSL = 'true';
        const { db } = await import('../index');

        void db.select;
        void db.insert;
        void db.select;

        expect(createPool).toHaveBeenCalledTimes(1);
        expect(createPool).toHaveBeenCalledWith(expect.objectContaining({
            host: 'db.example.com',
            port: 4000,
            ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
        }));
        expect(drizzle).toHaveBeenCalledTimes(1);
        expect(drizzle).toHaveBeenCalledWith({ client: { kind: 'pool' } });
    });

    it('forwards properties and binds methods to the real client', async () => {
        process.env.DATABASE_HOST = 'db.example.com';
        const { db } = await import('../index');
        const real = drizzle.mock.results[0]?.value ?? (void db.select, drizzle.mock.results[0].value);

        expect((db as unknown as { marker: string }).marker).toBe('database');
        // `select` returns `this`, so a bound method must return the real client, not the proxy
        expect(db.select()).toBe(real);
    });
});
