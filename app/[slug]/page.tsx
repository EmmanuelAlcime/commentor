import { Suspense } from "react";
import { PostDetail } from "@/features/posts/presentation/components/PostDetail";
import { PostDetailSkeleton } from "@/features/posts/presentation/components/PostDetailSkeleton";

export default function BlogPostPage({ params }: PageProps<"/[slug]">) {
    return (
        <Suspense fallback={<PostDetailSkeleton />}>
            <Post params={params} />
        </Suspense>
    );
}

async function Post({ params }: Pick<PageProps<"/[slug]">, "params">) {
    const { slug } = await params;
    return <PostDetail slug={slug} />;
}
