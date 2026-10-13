import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import type { CommentPreview } from "@/features/comments/domain/entities/comment";
import type { Post } from "@/features/posts/domain/entities/post";
import { postImageTransitionName } from "@/features/posts/presentation/transitions";
import { Avatar } from "@/shared/presentation/components/ui/Avatar";
import { Icon } from "@/shared/presentation/components/ui/Icon";

const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

function CommentPreviews({ previews }: { previews: CommentPreview[] }) {
    if (previews.length === 0) return null;

    return (
        <ul aria-label="Top comments" className="mt-auto flex flex-col gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
            {previews.map((preview) => (
                <li key={preview.id} className="flex items-start gap-2">
                    <Avatar name={preview.authorName} src={preview.authorImage} className="size-6 text-[10px]" />
                    <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                            <span className="truncate font-semibold text-zinc-800 dark:text-zinc-200">{preview.authorName}</span>
                            <span className="flex shrink-0 items-center gap-0.5" aria-label={`${preview.likeCount} likes`}>
                                <Icon name="thumb-up" className="size-3.5" />
                                {preview.likeCount}
                            </span>
                        </p>
                        <p className="line-clamp-2 text-sm text-zinc-700 dark:text-zinc-300">{preview.content}</p>
                    </div>
                </li>
            ))}
        </ul>
    );
}

const PostItems = ({ post, previews = [] }: { post: Post; previews?: CommentPreview[] }) => {
    const title = post.title ?? "Untitled post";

    return (
        <Link
            href={`/${post.slug}`}
            className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:focus-visible:outline-zinc-100"
        >
            <ViewTransition name={postImageTransitionName(post.id)} share="morph" default="none">
                <div className="relative aspect-[2/1] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    {post.image && (
                        <Image
                            src={post.image}
                            alt=""
                            fill
                            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                            className="object-cover transition duration-300 group-hover:scale-105"
                        />
                    )}
                </div>
            </ViewTransition>
            <div className="flex flex-1 flex-col gap-2 p-5">
                {post.createdAt && (
                    <time
                        dateTime={post.createdAt.toISOString()}
                        className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
                    >
                        {dateFormatter.format(post.createdAt)}
                    </time>
                )}
                <h3 className="text-lg font-semibold leading-snug text-zinc-900 dark:text-zinc-50">
                    {title}
                </h3>
                {post.content && (
                    <p className="line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">{post.content}</p>
                )}
                <CommentPreviews previews={previews} />
            </div>
        </Link>
    );
};
export default PostItems;
