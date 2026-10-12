import type { ReactNode } from "react";
import { ProfileNav } from "@/features/profile/presentation/components/ProfileNav";

export default function ProfileLayout({ children }: { children: ReactNode }) {
    return (
        <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Your profile</h1>
            <div className="mt-4">
                <ProfileNav />
            </div>
            <div className="mt-8">{children}</div>
        </div>
    );
}
