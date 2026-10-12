/**
 * Variables read: DATABASE_HOST, DATABASE_PORT, DATABASE_USERNAME,
 * DATABASE_PASSWORD, DATABASE_NAME, DATABASE_SSL. Typed as a plain string map
 * so `process.env` can be passed straight in.
 */
export type DatabaseEnv = Readonly<Record<string, string | undefined>>;

/** Subset of TLS settings accepted by both mysql2 and drizzle-kit. */
export type TlsOptions = {
    minVersion: 'TLSv1.2';
    rejectUnauthorized: boolean;
};

export type ConnectionOptions = {
    host: string;
    port: number;
    user: string | undefined;
    password: string | undefined;
    database: string | undefined;
    ssl: TlsOptions | undefined;
};

const DEFAULT_PORT = 3306;
const TRUTHY = new Set(['1', 'true', 'yes', 'on']);

// TiDB Cloud (and most hosted MySQL providers) only accept TLS connections.
// The server certificates chain to public CAs, so the system trust store is
// enough and no CA file needs to be shipped with the app.
const TLS_OPTIONS: TlsOptions = {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true,
};

/**
 * Builds the mysql2 connection options from environment variables.
 * Shared by the runtime client and drizzle-kit so both talk to the same server.
 *
 * - `DATABASE_PORT` defaults to 3306. TiDB Cloud listens on 4000.
 * - `DATABASE_SSL=true` enables TLS, which TiDB Cloud requires.
 */
export function buildConnectionOptions(env: DatabaseEnv): ConnectionOptions {
    const host = env.DATABASE_HOST;
    if (!host) {
        throw new Error('DATABASE_HOST is not set');
    }

    const port = parsePort(env.DATABASE_PORT);
    const ssl = isTruthy(env.DATABASE_SSL) ? TLS_OPTIONS : undefined;

    return {
        host,
        port,
        user: env.DATABASE_USERNAME,
        password: env.DATABASE_PASSWORD,
        database: env.DATABASE_NAME,
        ssl,
    };
}

function parsePort(raw: string | undefined): number {
    if (raw === undefined || raw.trim() === '') {
        return DEFAULT_PORT;
    }
    const port = Number(raw);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        throw new Error(`DATABASE_PORT must be a port number between 1 and 65535, got "${raw}"`);
    }
    return port;
}

function isTruthy(raw: string | undefined): boolean {
    return raw !== undefined && TRUTHY.has(raw.trim().toLowerCase());
}
