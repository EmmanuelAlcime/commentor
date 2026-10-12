import { describe, expect, it } from 'vitest';
import { buildConnectionOptions } from '../connection';

const base = {
    DATABASE_HOST: 'db.example.com',
    DATABASE_USERNAME: 'app',
    DATABASE_PASSWORD: 'secret',
    DATABASE_NAME: 'commenter',
};

describe('buildConnectionOptions', () => {
    it('defaults to port 3306 with no TLS for a local MySQL server', () => {
        const options = buildConnectionOptions(base);

        expect(options).toEqual({
            host: 'db.example.com',
            port: 3306,
            user: 'app',
            password: 'secret',
            database: 'commenter',
            ssl: undefined,
        });
    });

    it('enables TLS and a custom port for TiDB Cloud', () => {
        const options = buildConnectionOptions({
            ...base,
            DATABASE_HOST: 'gateway01.us-east-1.prod.aws.tidbcloud.com',
            DATABASE_PORT: '4000',
            DATABASE_SSL: 'true',
        });

        expect(options.host).toBe('gateway01.us-east-1.prod.aws.tidbcloud.com');
        expect(options.port).toBe(4000);
        expect(options.ssl).toEqual({ minVersion: 'TLSv1.2', rejectUnauthorized: true });
    });

    it.each(['1', 'yes', 'on', 'TRUE', ' true '])('treats DATABASE_SSL=%j as enabled', (value) => {
        expect(buildConnectionOptions({ ...base, DATABASE_SSL: value }).ssl).toBeDefined();
    });

    it.each(['0', 'false', 'no', 'off', ''])('treats DATABASE_SSL=%j as disabled', (value) => {
        expect(buildConnectionOptions({ ...base, DATABASE_SSL: value }).ssl).toBeUndefined();
    });

    it('treats an empty DATABASE_PORT as the default', () => {
        expect(buildConnectionOptions({ ...base, DATABASE_PORT: '' }).port).toBe(3306);
    });

    it('throws when DATABASE_HOST is missing', () => {
        expect(() => buildConnectionOptions({ ...base, DATABASE_HOST: undefined })).toThrow('DATABASE_HOST is not set');
        expect(() => buildConnectionOptions({ ...base, DATABASE_HOST: '' })).toThrow('DATABASE_HOST is not set');
    });

    it.each(['abc', '0', '70000', '3306.5'])('rejects an invalid DATABASE_PORT %j', (value) => {
        expect(() => buildConnectionOptions({ ...base, DATABASE_PORT: value })).toThrow('DATABASE_PORT must be a port number');
    });
});
