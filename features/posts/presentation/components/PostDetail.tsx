import { cacheLife, cacheTag } from "next/cache";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import { getPostBySlug } from "@/features/posts/di";
import { PostNotFoundError } from "@/features/posts/domain/errors";
import { postImageTransitionName } from "@/features/posts/presentation/transitions";
import { Breadcrumbs } from "@/shared/presentation/components/ui/Breadcrumbs";

const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "long" });

export async function PostDetail({ slug }: { slug: string }) {
    "use cache";
    cacheLife("hours");
    cacheTag("posts", `post:${slug}`);

    const post = await getPostBySlug(slug).catch((error: unknown) => {
        if (error instanceof PostNotFoundError) notFound();
        throw error;
    });

    const title = post.title ?? "Untitled post";

    return (
        <article className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: title }]} className="mb-8" />
            {post.createdAt && (
                <time
                    dateTime={post.createdAt.toISOString()}
                    className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
                >
                    {dateFormatter.format(post.createdAt)}
                </time>
            )}
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                {title}
            </h1>
            {post.image && (
                <ViewTransition name={postImageTransitionName(post.id)} share="morph" default="none">
                    <div className="relative mt-8 aspect-[2/1] overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
                        <Image src={post.image} alt="" fill priority sizes="(min-width: 768px) 768px, 100vw" className="object-cover" />
                    </div>
                </ViewTransition>
            )}
            {post.content && (
                <p className="mt-8 text-lg leading-8 text-zinc-700 dark:text-zinc-300">{post.content}</p>
            )}
        </article>
    );
}
