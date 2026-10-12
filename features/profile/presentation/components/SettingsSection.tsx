import type { ReactNode } from "react";

type Props = {
    title: string;
    description: string;
    children: ReactNode;
    // Red framing for irreversible actions
    danger?: boolean;
};

export function SettingsSection({ title, description, children, danger = false }: Props) {
    const frame = danger
        ? "border-red-200 dark:border-red-900"
        : "border-zinc-200 dark:border-zinc-800";

    return (
        <section aria-labelledby={`${title}-heading`} className={`rounded-2xl border bg-white p-6 shadow-sm dark:bg-zinc-900 ${frame}`}>
            <h2 id={`${title}-heading`} className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {title}
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
            <div className="mt-6">{children}</div>
        </section>
    );
}
