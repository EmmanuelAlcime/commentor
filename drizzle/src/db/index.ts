import 'dotenv/config';
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2";

const host = process.env.DATABASE_HOST;
if (!host) {
    throw new Error("DATABASE_HOST is not set");
}

// drizzle-orm 1.0 RC reads `client.config`, which mysql2's promise pool lacks,
// so pass the callback pool and let drizzle wrap it with `.promise()`
const pool = mysql.createPool({
    host,
    port: 3306,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
});

export const db = drizzle({ client: pool });
