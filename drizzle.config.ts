import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    out: './drizzle/migrations',
    schema: './drizzle/src/db/schema.ts',
    dialect: 'mysql',
    dbCredentials: {
        host: process.env.DATABASE_HOST!,
        port: 3306,
        user: process.env.DATABASE_USERNAME!,
        password: process.env.DATABASE_PASSWORD!,
        database: process.env.DATABASE_NAME!,
    },
});

