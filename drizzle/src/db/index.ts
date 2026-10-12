import 'dotenv/config';
import { drizzle } from "drizzle-orm/mysql2";

const url = process.env.DATABASE_URL;
if (!url) {
    throw new Error("DATABASE_URL is not set");
}

export const db = drizzle(url);
