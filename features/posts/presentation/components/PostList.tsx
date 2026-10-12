import { cacheLife, cacheTag } from 'next/cache';
import { notFound } from 'next/navigation';
import { getPaginatedPosts } from '@/features/posts/di';
import PostItems from "@/features/posts/presentation/components/PostItems";
import { Pagination } from "@/features/posts/presentation/components/Pagination";
import { InvalidPageError } from '@/shared/domain/pagination';


export async function PostList({ page }: { page: number }) {
    'use cache';
    cacheLife('hours');
    cacheTag('posts');

    const { items: posts, totalPages } = await getPaginatedPosts(page).catch((error: unknown) => {
        if (error instanceof InvalidPageError) notFound();
        throw error;
    });

    if (posts.length === 0) {
        return <p className="py-16 text-center text-zinc-500 dark:text-zinc-400">No posts found</p>;
    }

    return (
        <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
            <h2 className="mb-8 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Latest posts</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                    <PostItems post={post} key={post.id} />
                ))}
            </div>
            <Pagination page={page} totalPages={totalPages} />
        </section>
    );
}
