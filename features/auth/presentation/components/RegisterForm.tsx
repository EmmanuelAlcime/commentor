"use client";

import Link from "next/link";
import { useActionState } from "react";
import { PASSWORD_MIN_LENGTH } from "@/features/auth/domain/entities/auth-user";
import { registerAction } from "../actions/auth-actions";
import type { AuthFormState } from "../actions/auth-form-state";
import { FormAlert } from "@/shared/presentation/components/ui/FormAlert";
import { FormField } from "@/shared/presentation/components/ui/FormField";
import { SubmitButton } from "@/shared/presentation/components/ui/SubmitButton";

const initialState: AuthFormState = {};

export function RegisterForm({ callbackURL }: { callbackURL: string }) {
    const [state, formAction, pending] = useActionState(registerAction, initialState);
    const loginHref = callbackURL === "/" ? "/login" : `/login?callbackURL=${encodeURIComponent(callbackURL)}`;
    const termsError = state.fieldErrors?.acceptTerms;

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
            <div className="flex flex-col gap-1.5">
                <label htmlFor="acceptTerms" className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                    <input
                        id="acceptTerms"
                        name="acceptTerms"
                        type="checkbox"
                        required
                        aria-invalid={termsError ? true : undefined}
                        aria-describedby={termsError ? "acceptTerms-error" : undefined}
                        className="mt-0.5 size-4 shrink-0 rounded border-zinc-300 accent-zinc-900 dark:border-zinc-700 dark:accent-zinc-100"
                    />
                    <span>
                        I have read and agree to the{" "}
                        <Link href="/terms" target="_blank" className="font-medium text-zinc-900 underline dark:text-zinc-100">
                            User Agreement
                        </Link>
                        .
                    </span>
                </label>
                {termsError && (
                    <p id="acceptTerms-error" className="text-sm text-red-600 dark:text-red-400">
                        {termsError}
                    </p>
                )}
            </div>
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
