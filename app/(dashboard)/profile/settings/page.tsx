import type { Metadata } from "next";
import { Suspense } from "react";
import { AvatarForm } from "@/features/profile/presentation/components/AvatarForm";
import { ChangeEmailForm } from "@/features/profile/presentation/components/ChangeEmailForm";
import { ChangePasswordForm } from "@/features/profile/presentation/components/ChangePasswordForm";
import { DeleteAccountForm } from "@/features/profile/presentation/components/DeleteAccountForm";
import { ProfileNameForm } from "@/features/profile/presentation/components/ProfileNameForm";
import { SettingsSection } from "@/features/profile/presentation/components/SettingsSection";
import { requireProfile } from "@/features/profile/presentation/require-profile";
import { Skeleton } from "@/shared/presentation/components/ui/Skeleton";

export const metadata: Metadata = { title: "Profile settings" };

export default function ProfileSettingsPage() {
    return (
        <Suspense fallback={<SettingsSkeleton />}>
            <Settings />
        </Suspense>
    );
}

async function Settings() {
    const profile = await requireProfile("/profile/settings");

    return (
        <div className="flex flex-col gap-6">
            <SettingsSection title="Profile picture" description="Shown next to your name and your comments.">
                <AvatarForm profile={profile} />
            </SettingsSection>
            <SettingsSection title="Name" description="How you appear to other readers.">
                <ProfileNameForm profile={profile} />
            </SettingsSection>
            <SettingsSection title="Email" description="Used to log in. Changing it takes effect right away.">
                <ChangeEmailForm profile={profile} />
            </SettingsSection>
            <SettingsSection title="Password" description="Changing your password signs you out everywhere else.">
                <ChangePasswordForm />
            </SettingsSection>
            <SettingsSection
                title="Delete account"
                description="Permanently removes your account, profile picture, comments and likes. This cannot be undone."
                danger
            >
                <DeleteAccountForm />
            </SettingsSection>
        </div>
    );
}

function SettingsSkeleton() {
    return (
        <div role="status" aria-busy="true" aria-label="Loading settings" className="flex flex-col gap-6">
            {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="h-44 w-full rounded-2xl" />
            ))}
        </div>
    );
}
