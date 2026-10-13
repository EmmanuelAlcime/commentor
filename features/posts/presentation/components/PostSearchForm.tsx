import { POST_SORTS, type PostSort } from "@/features/posts/domain/entities/post-query";
import { SEARCH_MAX_LENGTH } from "@/features/posts/domain/entities/post-query";

const sortLabels: Record<PostSort, string> = { newest: "Newest first", oldest: "Oldest first" };

// A plain GET form, so searching works before any JavaScript loads and the result has a shareable URL
export function PostSearchForm({ search, sort }: { search: string; sort: PostSort }) {
    return (
        <form role="search" action="/" method="get" className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex flex-1 flex-col gap-1.5">
                <label htmlFor="post-search" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    Search posts
                </label>
                <input
                    id="post-search"
                    type="search"
                    name="q"
                    defaultValue={search}
                    placeholder="Search by title or content…"
                    maxLength={SEARCH_MAX_LENGTH}
                    className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-100 dark:focus:ring-zinc-100/10"
                />
            </div>
            <div className="flex flex-col gap-1.5">
                <label htmlFor="post-sort" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    Sort
                </label>
                <select
                    id="post-sort"
                    name="sort"
                    defaultValue={sort}
                    className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-100 dark:focus:ring-zinc-100/10"
                >
                    {POST_SORTS.map((value) => (
                        <option key={value} value={value}>
                            {sortLabels[value]}
                        </option>
                    ))}
                </select>
            </div>
            <button
                type="submit"
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
                Search
            </button>
        </form>
    );
}
