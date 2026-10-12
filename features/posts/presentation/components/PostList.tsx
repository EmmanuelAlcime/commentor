import { cacheLife, cacheTag } from 'next/cache';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTopCommentPreviews } from '@/features/comments/di';
import { getPaginatedPosts } from '@/features/posts/di';
import type { PostSort } from '@/features/posts/domain/entities/post-query';
import PostItems from '@/features/posts/presentation/components/PostItems';
import { Pagination } from '@/features/posts/presentation/components/Pagination';
import { PostSearchForm } from '@/features/posts/presentation/components/PostSearchForm';
import { postListHref } from '@/features/posts/presentation/post-list-params';
import { InvalidPageError } from '@/shared/domain/pagination';

const PREVIEW_COUNT = 2;

const resultsLabel = (count: number) => `${count} ${count === 1 ? 'post' : 'posts'}`;

export async function PostList({ page, search, sort }: { page: number; search: string; sort: PostSort }) {
    'use cache';
    cacheLife('hours');
    // Comment mutations expire "comments" so the previews on the cards stay current
    cacheTag('posts', 'comments');

    const { items: posts, totalPages, totalItems, query } = await getPaginatedPosts({ page, search, sort }).catch((error: unknown) => {
        if (error instanceof InvalidPageError) notFound();
        throw error;
    });
    const previews = await getTopCommentPreviews({ postIds: posts.map((post) => post.id), limit: PREVIEW_COUNT });
    const searching = query.search !== '';

    return (
        <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
            <h2 className="mb-6 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                {query.sort === 'oldest' ? 'Oldest posts' : 'Latest posts'}
            </h2>
            <div className="mb-8 flex flex-col gap-3">
                <PostSearchForm search={query.search} sort={query.sort} />
                {searching && (
                    <p role="status" className="text-sm text-zinc-600 dark:text-zinc-400">
                        {resultsLabel(totalItems)} matching <span className="font-semibold text-zinc-900 dark:text-zinc-50">“{query.search}”</span>.{' '}
                        <Link href={postListHref({ sort: query.sort })} className="font-medium text-zinc-900 underline dark:text-zinc-100">
                            Clear search
                        </Link>
                    </p>
                )}
            </div>
            {posts.length === 0 ? (
                <p className="py-16 text-center text-zinc-500 dark:text-zinc-400">
                    {searching ? 'No posts match your search.' : 'No posts found'}
                </p>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {posts.map((post) => (
                        <PostItems post={post} previews={previews[post.id] ?? []} key={post.id} />
                    ))}
                </div>
            )}
            <Pagination
                page={page}
                totalPages={totalPages}
                hrefFor={(n) => postListHref({ page: n, search: query.search, sort: query.sort })}
            />
        </section>
    );
}
