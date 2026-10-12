import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/drizzle/src/db";
import * as authSchema from "@/features/auth/data/auth.schema";
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "@/features/auth/domain/entities/auth-user";

// BETTER_AUTH_SECRET and BETTER_AUTH_URL are read from the environment
export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "mysql",
        schema: authSchema,
    }),
    emailAndPassword: {
        enabled: true,
        minPasswordLength: PASSWORD_MIN_LENGTH,
        maxPasswordLength: PASSWORD_MAX_LENGTH,
    },
    // nextCookies must stay last so server actions can set the session cookie
    plugins: [nextCookies()],
});
