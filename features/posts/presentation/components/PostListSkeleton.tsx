import { Skeleton } from "@/shared/presentation/components/ui/Skeleton";

function PostItemSkeleton() {
    return (
        <div className="flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <Skeleton className="aspect-[2/1] rounded-none" />
            <div className="flex flex-1 flex-col gap-2 p-5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
            </div>
        </div>
    );
}

export function PostListSkeleton({ count = 6 }: { count?: number }) {
    return (
        <section
            role="status"
            aria-busy="true"
            aria-label="Loading posts"
            className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8"
        >
            <Skeleton className="mb-8 h-9 w-48" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: count }, (_, i) => (
                    <PostItemSkeleton key={i} />
                ))}
            </div>
        </section>
    );
}
