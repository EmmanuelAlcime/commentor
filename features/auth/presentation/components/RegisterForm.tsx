"use client";

import Link from "next/link";
import { useActionState } from "react";
import { PASSWORD_MIN_LENGTH } from "@/features/auth/domain/entities/auth-user";
import { registerAction } from "../actions/auth-actions";
import type { AuthFormState } from "../actions/auth-form-state";
import { FormAlert } from "./FormAlert";
import { FormField } from "./FormField";
import { SubmitButton } from "./SubmitButton";

const initialState: AuthFormState = {};

export function RegisterForm({ callbackURL }: { callbackURL: string }) {
    const [state, formAction, pending] = useActionState(registerAction, initialState);
    const loginHref = callbackURL === "/" ? "/login" : `/login?callbackURL=${encodeURIComponent(callbackURL)}`;

    return (
        <form action={formAction} className="flex flex-col gap-5">
            <input type="hidden" name="callbackURL" value={callbackURL} />
            <FormAlert message={state.error} />
            <FormField
                label="Name"
                name="name"
                autoComplete="name"
                required
                defaultValue={state.values?.name}
                error={state.fieldErrors?.name}
            />
            <FormField
                label="Email"
                name="email"
                type="email"
                autoComplete="email"
                required
                defaultValue={state.values?.email}
                error={state.fieldErrors?.email}
            />
            <FormField
                label="Password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={PASSWORD_MIN_LENGTH}
                error={state.fieldErrors?.password}
            />
            <FormField
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                error={state.fieldErrors?.confirmPassword}
            />
            <SubmitButton pending={pending}>{pending ? "Creating account..." : "Create account"}</SubmitButton>
            <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
                Already have an account?{" "}
                <Link href={loginHref} className="font-medium text-zinc-900 underline dark:text-zinc-100">
                    Log in
                </Link>
            </p>
        </form>
    );
}
