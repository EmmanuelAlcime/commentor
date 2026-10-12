"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signInAction } from "../actions/auth-actions";
import type { AuthFormState } from "../actions/auth-form-state";
import { FormAlert } from "@/shared/presentation/components/ui/FormAlert";
import { FormField } from "@/shared/presentation/components/ui/FormField";
import { SubmitButton } from "@/shared/presentation/components/ui/SubmitButton";

const initialState: AuthFormState = {};

export function LoginForm({ callbackURL }: { callbackURL: string }) {
    const [state, formAction, pending] = useActionState(signInAction, initialState);
    const registerHref = callbackURL === "/" ? "/register" : `/register?callbackURL=${encodeURIComponent(callbackURL)}`;

    return (
        <form action={formAction} className="flex flex-col gap-5">
            <input type="hidden" name="callbackURL" value={callbackURL} />
            <FormAlert message={state.error} />
            <FormField label="Email" name="email" type="email" autoComplete="email" required defaultValue={state.values?.email} />
            <FormField label="Password" name="password" type="password" autoComplete="current-password" required />
            <SubmitButton pending={pending}>{pending ? "Logging in..." : "Log in"}</SubmitButton>
            <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
                No account yet?{" "}
                <Link href={registerHref} className="font-medium text-zinc-900 underline dark:text-zinc-100">
                    Sign up
                </Link>
            </p>
        </form>
    );
}
