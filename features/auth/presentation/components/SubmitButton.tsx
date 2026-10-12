import type { ReactNode } from "react";

export function SubmitButton({ pending, children }: { pending: boolean; children: ReactNode }) {
    return (
        <button
            type="submit"
            disabled={pending}
            aria-disabled={pending}
            className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
            {children}
        </button>
    );
}
