import { getCurrentUser } from "@/features/auth/di";
import { getPostLikes } from "@/features/posts/di";
import { LikeButton } from "@/shared/presentation/components/LikeButton";
import { Skeleton } from "@/shared/presentation/components/ui/Skeleton";
import { setPostLikeAction } from "../actions/post-like-actions";

// Reads the session, so it must be rendered inside a <Suspense> boundary
export async function PostLikes({ postId }: { postId: number }) {
    const user = await getCurrentUser();
    const likes = await getPostLikes(postId, user?.id ?? null);

    return (
        <LikeButton
            count={likes.count}
            liked={likes.likedByViewer}
            signedIn={user !== null}
            action={setPostLikeAction.bind(null, postId)}
            subject="this post"
        />
    );
}

export function PostLikesSkeleton() {
    return <Skeleton className="h-10 w-16 rounded-full" />;
}
