import 'dotenv/config';
import { drizzle, type MySql2Database } from "drizzle-orm/mysql2";
import mysql from "mysql2";
import { buildConnectionOptions } from './connection';

type Database = MySql2Database;

let instance: Database | undefined;

function getDatabase(): Database {
    if (!instance) {
        // drizzle-orm 1.0 RC reads `client.config`, which mysql2's promise pool lacks,
        // so pass the callback pool and let drizzle wrap it with `.promise()`
        const pool = mysql.createPool(buildConnectionOptions(process.env));
        instance = drizzle({ client: pool });
    }
    return instance;
}

// The client is created on first use rather than at import time. `next build`
// loads every route module to collect page data, and the auth module imports
// this file, so an eager client would make the build itself require database
// credentials. Missing credentials still fail fast: the first query throws.
export const db: Database = new Proxy({} as Database, {
    get(_target, property) {
        const database = getDatabase();
        const value = Reflect.get(database, property, database);
        return typeof value === 'function' ? value.bind(database) : value;
    },
});
