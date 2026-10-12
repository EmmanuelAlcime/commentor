import { Suspense } from "react";
import { PostDetail } from "@/features/posts/presentation/components/PostDetail";

export default function BlogPostPage({ params }: PageProps<"/[slug]">) {
    return (
        <Suspense fallback={<p className="px-4 py-12 text-center text-zinc-500">Loading post...</p>}>
            <Post params={params} />
        </Suspense>
    );
}

async function Post({ params }: Pick<PageProps<"/[slug]">, "params">) {
    const { slug } = await params;
    return <PostDetail slug={slug} />;
}
