import Link from "next/link";
import { getAuthorCommentHistory } from "@/features/comments/di";
import type { CommentHistoryItem } from "@/features/comments/domain/entities/comment";
import { formatRelativeTime } from "@/shared/presentation/format-relative-time";
import { Icon } from "@/shared/presentation/components/ui/Icon";
import { Skeleton } from "@/shared/presentation/components/ui/Skeleton";

const likesLabel = (count: number) => `${count} ${count === 1 ? "like" : "likes"}`;

function HistoryItem({ item }: { item: CommentHistoryItem }) {
    const postLabel = item.postTitle ?? "a deleted post";

    return (
        <li className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="flex flex-wrap items-center gap-x-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                {item.parentId !== null && (
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        Reply
                    </span>
                )}
                <span>on</span>
                {item.postSlug ? (
                    <Link
                        href={`/${item.postSlug}`}
                        className="font-medium text-zinc-900 underline-offset-2 hover:underline dark:text-zinc-50"
                    >
                        {postLabel}
                    </Link>
                ) : (
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">{postLabel}</span>
                )}
                {item.createdAt && (
                    <>
                        <span aria-hidden="true">·</span>
                        <time dateTime={item.createdAt.toISOString()} title={item.createdAt.toLocaleString()}>
                            {formatRelativeTime(item.createdAt)}
                        </time>
                    </>
                )}
                {item.editedAt && <span>(edited)</span>}
            </p>
            <p className="mt-2 whitespace-pre-wrap break-words text-zinc-900 dark:text-zinc-100">{item.content}</p>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                <Icon name="thumb-up" className="size-4" />
                {likesLabel(item.likeCount)}
            </p>
        </li>
    );
}

export async function CommentHistory({ userId }: { userId: string }) {
    const history = await getAuthorCommentHistory(userId);

    return (
        <section aria-labelledby="comment-history-heading" className="mt-8">
            <h2 id="comment-history-heading" className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                <Icon name="chat" className="size-5" />
                Your comments
                <span className="text-base font-medium text-zinc-500 dark:text-zinc-400">{history.length}</span>
            </h2>
            {history.length === 0 ? (
                <p className="mt-4 rounded-xl border border-dashed border-zinc-300 px-4 py-6 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
                    You have not commented yet.{" "}
                    <Link href="/" className="font-semibold text-zinc-900 underline-offset-2 hover:underline dark:text-zinc-50">
                        Find a post
                    </Link>{" "}
                    to join the conversation.
                </p>
            ) : (
                <ol className="mt-4 space-y-3">
                    {history.map((item) => (
                        <HistoryItem key={item.id} item={item} />
                    ))}
                </ol>
            )}
        </section>
    );
}

export function CommentHistorySkeleton() {
    return (
        <div role="status" aria-busy="true" aria-label="Loading your comments" className="mt-8">
            <Skeleton className="h-6 w-44" />
            <div className="mt-4 space-y-3">
                {Array.from({ length: 3 }, (_, i) => (
                    <div key={i} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="mt-3 h-4 w-full" />
                        <Skeleton className="mt-2 h-4 w-2/3" />
                    </div>
                ))}
            </div>
        </div>
    );
}
