import type { InputHTMLAttributes } from "react";

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    name: string;
    error?: string;
};

export function FormField({ label, name, error, ...inputProps }: FormFieldProps) {
    const errorId = `${name}-error`;

    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={name} className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {label}
            </label>
            <input
                id={name}
                name={name}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? errorId : undefined}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 aria-invalid:border-red-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-100 dark:focus:ring-zinc-100/10"
                {...inputProps}
            />
            {error && (
                <p id={errorId} className="text-sm text-red-600 dark:text-red-400">
                    {error}
                </p>
            )}
        </div>
    );
}
