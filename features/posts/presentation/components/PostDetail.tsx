import { cacheLife, cacheTag } from "next/cache";
import Image from "next/image";
import { notFound } from "next/navigation";
import { type ReactNode, Suspense, ViewTransition } from "react";
import { getPostBySlug } from "@/features/posts/di";
import { PostNotFoundError } from "@/features/posts/domain/errors";
import { postImageTransitionName } from "@/features/posts/presentation/transitions";
import { Breadcrumbs } from "@/shared/presentation/components/ui/Breadcrumbs";
import { PostLikes, PostLikesSkeleton } from "./PostLikes";

const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "long" });

// The post itself is the same for everyone, so it is cached; likes and comments depend on the viewer and are not
async function findPost(slug: string) {
    "use cache";
    cacheLife("hours");
    cacheTag("posts", `post:${slug}`);

    return getPostBySlug(slug).catch((error: unknown) => {
        if (error instanceof PostNotFoundError) return null;
        throw error;
    });
}

// `children` receives the post id so the page can add other features (such as comments) below the post
export async function PostDetail({ slug, children }: { slug: string; children?: (postId: number) => ReactNode }) {
    const post = await findPost(slug);
    if (!post) notFound();

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
            <div className="mt-8 flex items-center border-t border-zinc-200 pt-6 dark:border-zinc-800">
                <Suspense fallback={<PostLikesSkeleton />}>
                    <PostLikes postId={post.id} />
                </Suspense>
            </div>
            {children?.(post.id)}
        </article>
    );
}
