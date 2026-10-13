import Link from "next/link";

const linkClass =
    "rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800";
const activeClass =
    "rounded-lg border border-zinc-900 bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900";
const disabledClass =
    "rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-400 dark:border-zinc-800 dark:text-zinc-600";

type Props = {
    page: number;
    totalPages: number;
    // Builds the link for a page so the caller can keep its own query string (search, sort)
    hrefFor: (page: number) => string;
};

export function Pagination({ page, totalPages, hrefFor }: Props) {
    if (totalPages <= 1) return null;

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <nav aria-label="Pagination" className="mt-12 flex flex-wrap items-center justify-center gap-2 px-4">
            {page > 1 ? (
                <Link href={hrefFor(page - 1)} rel="prev" className={linkClass}>
                    Previous
                </Link>
            ) : (
                <span aria-disabled="true" className={disabledClass}>Previous</span>
            )}
            {pages.map((n) =>
                n === page ? (
                    <span key={n} aria-current="page" className={activeClass}>{n}</span>
                ) : (
                    <Link key={n} href={hrefFor(n)} className={linkClass}>{n}</Link>
                ),
            )}
            {page < totalPages ? (
                <Link href={hrefFor(page + 1)} rel="next" className={linkClass}>
                    Next
                </Link>
            ) : (
                <span aria-disabled="true" className={disabledClass}>Next</span>
            )}
        </nav>
    );
}
