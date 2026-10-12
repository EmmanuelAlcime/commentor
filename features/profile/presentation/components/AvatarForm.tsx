"use client";

import { useActionState } from "react";
import { AVATAR_MAX_BYTES } from "@/features/profile/domain/entities/avatar";
import type { Profile } from "@/features/profile/domain/entities/profile";
import { Avatar } from "@/shared/presentation/components/ui/Avatar";
import { FormAlert } from "@/shared/presentation/components/ui/FormAlert";
import { SubmitButton } from "@/shared/presentation/components/ui/SubmitButton";
import { removeAvatarAction, uploadAvatarAction } from "../actions/profile-actions";
import { initialProfileFormState } from "../actions/profile-form-state";

const maxMb = AVATAR_MAX_BYTES / (1024 * 1024);

export function AvatarForm({ profile }: { profile: Pick<Profile, "name" | "image"> }) {
    const [uploadState, upload, uploading] = useActionState(uploadAvatarAction, initialProfileFormState);
    const [removeState, remove, removing] = useActionState(removeAvatarAction, initialProfileFormState);
    // Whichever form ran last owns the message
    const state = removeState.status !== "idle" && uploadState.status === "idle" ? removeState : uploadState;

    return (
        <div className="flex flex-col gap-5">
            <FormAlert message={state.message} tone={state.status === "success" ? "success" : "error"} />
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <Avatar name={profile.name} src={profile.image} className="size-24 text-3xl" />
                <form action={upload} className="flex flex-1 flex-col gap-3">
                    <label htmlFor="avatar" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        Choose an image
                    </label>
                    <input
                        id="avatar"
                        name="avatar"
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        required
                        className="block w-full text-sm text-zinc-600 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-zinc-900 hover:file:bg-zinc-200 dark:text-zinc-400 dark:file:bg-zinc-800 dark:file:text-zinc-100 dark:hover:file:bg-zinc-700"
                    />
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">PNG, JPEG, WebP or GIF, up to {maxMb} MB.</p>
                    <div className="flex flex-wrap gap-2">
                        <SubmitButton pending={uploading}>{uploading ? "Uploading…" : "Upload picture"}</SubmitButton>
                    </div>
                </form>
            </div>
            {profile.image && (
                <form action={remove}>
                    <button
                        type="submit"
                        disabled={removing}
                        className="text-sm font-medium text-red-600 underline-offset-2 hover:underline disabled:opacity-60 dark:text-red-400"
                    >
                        {removing ? "Removing…" : "Remove picture"}
                    </button>
                </form>
            )}
        </div>
    );
}
