import Image from "next/image";

// Initials on a colour picked from the name, so the same person always gets the same colour
const colors = [
    "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
    "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
    "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
    "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
] as const;

export function initials(name: string): string {
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return "?";
    const letters = words.length === 1 ? words[0].slice(0, 1) : words[0].slice(0, 1) + words[words.length - 1].slice(0, 1);
    return letters.toUpperCase();
}

const colorFor = (name: string) => colors[[...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % colors.length];

type Props = {
    name: string;
    // Profile picture URL; falls back to initials when missing
    src?: string | null;
    className?: string;
};

export function Avatar({ name, src, className = "size-9 text-sm" }: Props) {
    if (src) {
        // Pictures are served by this app and already sized, so they skip the image optimizer
        return (
            <Image
                src={src}
                alt=""
                aria-hidden="true"
                width={96}
                height={96}
                unoptimized
                className={`shrink-0 select-none rounded-full object-cover ${className}`}
            />
        );
    }

    return (
        <span
            aria-hidden="true"
            className={`flex shrink-0 select-none items-center justify-center rounded-full font-semibold ${colorFor(name)} ${className}`}
        >
            {initials(name)}
        </span>
    );
}
