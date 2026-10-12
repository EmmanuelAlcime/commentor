import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
import { buildConnectionOptions } from './drizzle/src/db/connection';

const connection = buildConnectionOptions(process.env);

export default defineConfig({
    out: './drizzle/migrations',
    schema: './drizzle/src/db/schema.ts',
    dialect: 'mysql',
    dbCredentials: {
        host: connection.host,
        port: connection.port,
        user: connection.user,
        password: connection.password,
        database: connection.database!,
        ssl: connection.ssl,
    },
});
