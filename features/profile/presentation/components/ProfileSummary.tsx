import type { Profile } from "@/features/profile/domain/entities/profile";
import { Avatar } from "@/shared/presentation/components/ui/Avatar";
import { Skeleton } from "@/shared/presentation/components/ui/Skeleton";

const joined = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });

export function ProfileSummary({ profile }: { profile: Profile }) {
    return (
        <div className="flex items-center gap-4">
            <Avatar name={profile.name} src={profile.image} className="size-16 text-xl" />
            <div className="min-w-0">
                <p className="truncate text-xl font-semibold text-zinc-900 dark:text-zinc-50">{profile.name}</p>
                <p className="truncate text-sm text-zinc-600 dark:text-zinc-400">{profile.email}</p>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-500">Joined {joined.format(profile.createdAt)}</p>
            </div>
        </div>
    );
}

export function ProfileSummarySkeleton() {
    return (
        <div aria-hidden="true" className="flex items-center gap-4">
            <Skeleton className="size-16 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-56" />
                <Skeleton className="h-3 w-24" />
            </div>
        </div>
    );
}
