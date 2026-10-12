import { PostList } from "@/features/posts/presentation/components/PostList";
import { PostListSkeleton } from "@/features/posts/presentation/components/PostListSkeleton";
import {Suspense} from "react";

export default function Home({ searchParams }: PageProps<"/">) {
  return <Suspense fallback={<PostListSkeleton />}>
    <Posts searchParams={searchParams} />
  </Suspense>;
}

async function Posts({ searchParams }: Pick<PageProps<"/">, "searchParams">) {
  const { page } = await searchParams;
  return <PostList page={typeof page === "string" ? Number(page) : 1} />;
}
