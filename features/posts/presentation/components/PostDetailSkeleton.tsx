import { Skeleton } from "@/shared/presentation/components/ui/Skeleton";

export function PostDetailSkeleton() {
    return (
        <article
            role="status"
            aria-busy="true"
            aria-label="Loading post"
            className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8"
        >
            <Skeleton className="mb-8 h-5 w-56" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="mt-3 h-10 w-4/5" />
            <Skeleton className="mt-8 aspect-[2/1] rounded-xl" />
            <div className="mt-8 space-y-3">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-11/12" />
                <Skeleton className="h-5 w-3/5" />
            </div>
        </article>
    );
}
