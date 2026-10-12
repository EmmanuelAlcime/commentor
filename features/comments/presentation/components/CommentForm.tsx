"use client";

import { type KeyboardEvent, useActionState, useEffect, useEffectEvent, useId } from "react";
import { COMMENT_MAX_LENGTH } from "@/features/comments/domain/entities/comment";
import { type CommentFormState, initialCommentFormState } from "../actions/comment-action-state";

type Props = {
    action: (state: CommentFormState, formData: FormData) => Promise<CommentFormState>;
    label: string;
    placeholder: string;
    submitLabel: string;
    pendingLabel: string;
    defaultValue?: string;
    autoFocus?: boolean;
    onCancel?: () => void;
    onSuccess?: () => void;
};

const secondaryButton =
    "rounded-full px-3 py-1.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50";
const primaryButton =
    "rounded-full bg-zinc-900 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300";

// Shared by new comments, replies and edits. React clears the textarea after a successful submit;
// after an error it is refilled with what the user typed.
export function CommentForm({ action, label, placeholder, submitLabel, pendingLabel, defaultValue, autoFocus, onCancel, onSuccess }: Props) {
    const [state, formAction, pending] = useActionState(action, initialCommentFormState);
    const id = useId();
    const errorId = `${id}-error`;

    const handleSuccess = useEffectEvent(() => onSuccess?.());
    useEffect(() => {
        if (state.status === "success") handleSuccess();
    }, [state]);

    // Cmd/Ctrl + Enter submits, as in most comment boxes
    const submitOnShortcut = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            event.currentTarget.form?.requestSubmit();
        }
    };

    const hasError = state.status === "error";

    return (
        <form action={formAction} className="flex w-full flex-col gap-2">
            <label htmlFor={id} className="sr-only">
                {label}
            </label>
            <textarea
                id={id}
                name="content"
                rows={2}
                required
                maxLength={COMMENT_MAX_LENGTH}
                placeholder={placeholder}
                defaultValue={hasError ? state.content : defaultValue}
                autoFocus={autoFocus}
                onKeyDown={submitOnShortcut}
                aria-invalid={hasError || undefined}
                aria-describedby={hasError ? errorId : undefined}
                className="w-full resize-y rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-600 dark:focus:ring-zinc-800"
            />
            {hasError && (
                <p id={errorId} role="alert" className="text-sm text-red-600 dark:text-red-400">
                    {state.error}
                </p>
            )}
            <div className="flex justify-end gap-2">
                {onCancel && (
                    <button type="button" onClick={onCancel} className={secondaryButton}>
                        Cancel
                    </button>
                )}
                <button type="submit" disabled={pending} className={primaryButton}>
                    {pending ? pendingLabel : submitLabel}
                </button>
            </div>
        </form>
    );
}
