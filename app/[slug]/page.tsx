import { Suspense } from "react";
import { CommentSection, CommentSectionSkeleton } from "@/features/comments/presentation/components/CommentSection";
import { PostDetail } from "@/features/posts/presentation/components/PostDetail";
import { PostDetailSkeleton } from "@/features/posts/presentation/components/PostDetailSkeleton";

export default function BlogPostPage({ params, searchParams }: PageProps<"/[slug]">) {
    return (
        <Suspense fallback={<PostDetailSkeleton />}>
            <Post params={params} searchParams={searchParams} />
        </Suspense>
    );
}

async function Post({ params, searchParams }: Pick<PageProps<"/[slug]">, "params" | "searchParams">) {
    const { slug } = await params;
    return (
        <PostDetail slug={slug}>
            {(postId) => (
                <Suspense fallback={<CommentSectionSkeleton />}>
                    <CommentSection postId={postId} searchParams={searchParams} />
                </Suspense>
            )}
        </PostDetail>
    );
}
