"use client";

import { useActionState, useState } from "react";
import { FormAlert } from "@/shared/presentation/components/ui/FormAlert";
import { FormField } from "@/shared/presentation/components/ui/FormField";
import { Icon } from "@/shared/presentation/components/ui/Icon";
import { deleteAccountAction } from "../actions/profile-actions";
import { initialProfileFormState } from "../actions/profile-form-state";

export function DeleteAccountForm() {
    const [open, setOpen] = useState(false);
    const [state, formAction, pending] = useActionState(deleteAccountAction, initialProfileFormState);

    if (!open) {
        return (
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950"
            >
                <Icon name="trash" className="size-4" />
                Delete account…
            </button>
        );
    }

    return (
        <form action={formAction} className="flex flex-col gap-5">
            <FormAlert message={state.message} />
            <FormField
                label="Your password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                error={state.fieldErrors?.password}
            />
            <label htmlFor="confirmDelete" className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                <input
                    id="confirmDelete"
                    name="confirmDelete"
                    type="checkbox"
                    required
                    className="mt-0.5 size-4 shrink-0 rounded border-zinc-300 accent-red-600 dark:border-zinc-700"
                />
                <span>I understand that my account, profile picture, comments and likes will be permanently deleted.</span>
            </label>
            <div className="flex flex-wrap gap-2">
                <button
                    type="submit"
                    disabled={pending}
                    aria-disabled={pending}
                    className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <Icon name="trash" className="size-4" />
                    {pending ? "Deleting…" : "Delete my account"}
                </button>
                <button
                    type="button"
                    onClick={() => setOpen(false)}
                    disabled={pending}
                    className="rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:opacity-60 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}
