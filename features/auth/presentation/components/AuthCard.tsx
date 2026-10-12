import type { ReactNode } from "react";

export function AuthCard({ title, description, children }: { title: string; description: string; children: ReactNode }) {
    return (
        <div className="mx-auto w-full max-w-md px-4 py-16 sm:px-6">
            <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{title}</h1>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
                <div className="mt-8">{children}</div>
            </div>
        </div>
    );
}
