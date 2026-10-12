import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/features/posts/domain/entities/post";

const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

const PostItems = ({ post }: { post: Post }) => {
    const title = post.title ?? "Untitled post";

    return (
        <Link
            href={`/${post.slug}`}
            className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:focus-visible:outline-zinc-100"
        >
            <div className="relative aspect-[2/1] bg-zinc-100 dark:bg-zinc-800">
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
            <div className="flex flex-1 flex-col gap-2 p-5">
                {post.createdAt && (
                    <time
                        dateTime={post.createdAt.toISOString()}
                        className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
                    >
                        {dateFormatter.format(post.createdAt)}
                    </time>
                )}
                <h3 className="text-lg font-semibold leading-snug text-zinc-900 group-hover:underline dark:text-zinc-50">
                    {title}
                </h3>
                {post.content && (
                    <p className="line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">{post.content}</p>
                )}
            </div>
        </Link>
    );
};
export default PostItems;
