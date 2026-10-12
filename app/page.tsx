import { Suspense } from "react";
import { PostList } from "@/features/posts/presentation/components/PostList";
import { PostListSkeleton } from "@/features/posts/presentation/components/PostListSkeleton";
import { parsePostListParams } from "@/features/posts/presentation/post-list-params";

export default function Home({ searchParams }: PageProps<"/">) {
  return <Suspense fallback={<PostListSkeleton />}>
    <Posts searchParams={searchParams} />
  </Suspense>;
}

async function Posts({ searchParams }: Pick<PageProps<"/">, "searchParams">) {
  const { page, search, sort } = parsePostListParams(await searchParams);
  return <PostList page={page} search={search} sort={sort} />;
}
