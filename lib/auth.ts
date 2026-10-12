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
    user: {
        additionalFields: {
            // Set once at sign-up; `input: true` lets signUpEmail accept it, the use case decides the value
            termsAcceptedAt: { type: "date", required: false, input: true },
        },
        // No email provider is configured, so unverified users may change their address directly
        changeEmail: { enabled: true, updateEmailWithoutVerification: true },
        // The profile page lets users delete their own account; the password is checked before deleting
        deleteUser: { enabled: true },
    },
    // nextCookies must stay last so server actions can set the session cookie
    plugins: [nextCookies()],
});
