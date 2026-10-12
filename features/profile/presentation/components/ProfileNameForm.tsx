"use client";

import { useActionState } from "react";
import type { Profile } from "@/features/profile/domain/entities/profile";
import { FormAlert } from "@/shared/presentation/components/ui/FormAlert";
import { FormField } from "@/shared/presentation/components/ui/FormField";
import { SubmitButton } from "@/shared/presentation/components/ui/SubmitButton";
import { updateNameAction } from "../actions/profile-actions";
import { initialProfileFormState } from "../actions/profile-form-state";

export function ProfileNameForm({ profile }: { profile: Pick<Profile, "name"> }) {
    const [state, formAction, pending] = useActionState(updateNameAction, initialProfileFormState);

    return (
        <form action={formAction} className="flex flex-col gap-5">
            <FormAlert message={state.message} tone={state.status === "success" ? "success" : "error"} />
            <FormField
                label="Name"
                name="name"
                autoComplete="name"
                required
                defaultValue={state.values?.name ?? profile.name}
                error={state.fieldErrors?.name}
            />
            <div>
                <SubmitButton pending={pending}>{pending ? "Saving…" : "Save name"}</SubmitButton>
            </div>
        </form>
    );
}
