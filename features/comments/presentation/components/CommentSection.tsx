import Link from "next/link";
import { getCurrentUser } from "@/features/auth/di";
import { getPostComments } from "@/features/comments/di";
import type { CommentSort } from "@/features/comments/domain/entities/comment";
import { countComments } from "@/features/comments/domain/entities/comment-tree";
import { LoginLink } from "@/shared/presentation/components/LoginLink";
import { Avatar } from "@/shared/presentation/components/ui/Avatar";
import { Icon } from "@/shared/presentation/components/ui/Icon";
import { Skeleton } from "@/shared/presentation/components/ui/Skeleton";
import { createCommentAction } from "../actions/comment-actions";
import { parseCommentSort } from "../comment-sort";
import { CommentForm } from "./CommentForm";
import { CommentThread } from "./CommentThread";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const sortOptions: { value: CommentSort; label: string }[] = [
    { value: "newest", label: "Newest" },
    { value: "top", label: "Most liked" },
];

function SortTabs({ current }: { current: CommentSort }) {
    return (
        <nav aria-label="Sort comments" className="flex gap-1 rounded-full bg-zinc-100 p-1 dark:bg-zinc-800/60">
            {sortOptions.map(({ value, label }) => (
                <Link
                    key={value}
                    href={{ query: { sort: value } }}
                    replace
                    scroll={false}
                    aria-current={value === current ? "true" : undefined}
                    className={`rounded-full px-3 py-1 text-sm font-medium transition ${
                        value === current
                            ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-950 dark:text-zinc-50"
                            : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                    }`}
                >
                    {label}
                </Link>
            ))}
        </nav>
    );
}

// Reads the session and search params, so it must be rendered inside a <Suspense> boundary
export async function CommentSection({ postId, searchParams }: { postId: number; searchParams: SearchParams }) {
    const [user, params] = await Promise.all([getCurrentUser(), searchParams]);
    const sort = parseCommentSort(params.sort);
    const comments = await getPostComments({ postId, viewerId: user?.id ?? null, sort });
    const total = countComments(comments);

    return (
        <section aria-labelledby="comments-heading" className="mt-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 id="comments-heading" className="flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-zinc-50">
                    <Icon name="chat" className="size-6" />
                    Comments
                    <span className="text-base font-medium text-zinc-500 dark:text-zinc-400">{total}</span>
                </h2>
                {total > 1 && <SortTabs current={sort} />}
            </div>

            <div className="mt-6">
                {user ? (
                    <div className="flex gap-3">
                        <Avatar name={user.name} className="size-10 text-sm" />
                        <CommentForm
                            action={createCommentAction.bind(null, postId)}
                            label="Add a comment"
                            placeholder="Add a comment…"
                            submitLabel="Comment"
                            pendingLabel="Posting…"
                        />
                    </div>
                ) : (
                    <p className="rounded-xl border border-dashed border-zinc-300 px-4 py-3 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
                        <LoginLink className="font-semibold text-zinc-900 underline-offset-2 hover:underline dark:text-zinc-50">
                            Log in
                        </LoginLink>{" "}
                        to like, comment and reply.
                    </p>
                )}
            </div>

            {comments.length === 0 ? (
                <p className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400">No comments yet. Start the conversation.</p>
            ) : (
                <ol className="mt-8 space-y-6">
                    {comments.map((node) => (
                        <CommentThread key={node.id} node={node} viewerId={user?.id ?? null} depth={0} />
                    ))}
                </ol>
            )}
        </section>
    );
}

export function CommentSectionSkeleton() {
    return (
        <section role="status" aria-busy="true" aria-label="Loading comments" className="mt-10">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="mt-6 h-20 w-full rounded-xl" />
            <div className="mt-8 space-y-6">
                {Array.from({ length: 3 }, (_, i) => (
                    <div key={i} className="flex gap-3">
                        <Skeleton className="size-10 shrink-0 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
