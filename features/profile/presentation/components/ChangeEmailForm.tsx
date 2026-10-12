"use client";

import { useActionState } from "react";
import type { Profile } from "@/features/profile/domain/entities/profile";
import { FormAlert } from "@/shared/presentation/components/ui/FormAlert";
import { FormField } from "@/shared/presentation/components/ui/FormField";
import { SubmitButton } from "@/shared/presentation/components/ui/SubmitButton";
import { changeEmailAction } from "../actions/profile-actions";
import { initialProfileFormState } from "../actions/profile-form-state";

export function ChangeEmailForm({ profile }: { profile: Pick<Profile, "email"> }) {
    const [state, formAction, pending] = useActionState(changeEmailAction, initialProfileFormState);

    return (
        <form action={formAction} className="flex flex-col gap-5">
            <FormAlert message={state.message} tone={state.status === "success" ? "success" : "error"} />
            <FormField
                label="Email"
                name="email"
                type="email"
                autoComplete="email"
                required
                defaultValue={state.values?.email ?? profile.email}
                error={state.fieldErrors?.email}
            />
            <div>
                <SubmitButton pending={pending}>{pending ? "Saving…" : "Save email"}</SubmitButton>
            </div>
        </form>
    );
}
