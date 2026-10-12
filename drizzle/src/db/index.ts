import 'dotenv/config';
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2";
import { buildConnectionOptions } from './connection';

// drizzle-orm 1.0 RC reads `client.config`, which mysql2's promise pool lacks,
// so pass the callback pool and let drizzle wrap it with `.promise()`
const pool = mysql.createPool(buildConnectionOptions(process.env));

export const db = drizzle({ client: pool });
