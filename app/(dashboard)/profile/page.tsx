import type { Metadata } from "next";
import { Suspense } from "react";
import { CommentHistory, CommentHistorySkeleton } from "@/features/profile/presentation/components/CommentHistory";
import { ProfileSummary, ProfileSummarySkeleton } from "@/features/profile/presentation/components/ProfileSummary";
import { requireProfile } from "@/features/profile/presentation/require-profile";

export const metadata: Metadata = { title: "Your profile" };

export default function ProfilePage() {
    return (
        <Suspense
            fallback={
                <>
                    <ProfileSummarySkeleton />
                    <CommentHistorySkeleton />
                </>
            }
        >
            <ProfileOverview />
        </Suspense>
    );
}

async function ProfileOverview() {
    const profile = await requireProfile("/profile");
    return (
        <>
            <ProfileSummary profile={profile} />
            <Suspense fallback={<CommentHistorySkeleton />}>
                <CommentHistory userId={profile.id} />
            </Suspense>
        </>
    );
}
