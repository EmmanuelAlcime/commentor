import { PostList } from "@/features/posts/presentation/components/PostList";
import {Suspense} from "react";

export default function Home({ searchParams }: PageProps<"/">) {
  return <Suspense fallback={<div>Loading...</div>}>
    <Posts searchParams={searchParams} />
  </Suspense>;
}

async function Posts({ searchParams }: Pick<PageProps<"/">, "searchParams">) {
  const { page } = await searchParams;
  return <PostList page={typeof page === "string" ? Number(page) : 1} />;
}
