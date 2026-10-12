"use client";

import { useActionState, useEffect, useRef } from "react";
import { PASSWORD_MIN_LENGTH } from "@/features/auth/domain/entities/auth-user";
import { FormAlert } from "@/shared/presentation/components/ui/FormAlert";
import { FormField } from "@/shared/presentation/components/ui/FormField";
import { SubmitButton } from "@/shared/presentation/components/ui/SubmitButton";
import { changePasswordAction } from "../actions/profile-actions";
import { initialProfileFormState } from "../actions/profile-form-state";

export function ChangePasswordForm() {
    const [state, formAction, pending] = useActionState(changePasswordAction, initialProfileFormState);
    const formRef = useRef<HTMLFormElement>(null);

    // Passwords are never echoed back, so clear the fields once the change went through
    useEffect(() => {
        if (state.status === "success") formRef.current?.reset();
    }, [state]);

    return (
        <form ref={formRef} action={formAction} className="flex flex-col gap-5">
            <FormAlert message={state.message} tone={state.status === "success" ? "success" : "error"} />
            <FormField
                label="Current password"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                required
                error={state.fieldErrors?.currentPassword}
            />
            <FormField
                label="New password"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={PASSWORD_MIN_LENGTH}
                error={state.fieldErrors?.newPassword}
            />
            <FormField
                label="Confirm new password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                error={state.fieldErrors?.confirmPassword}
            />
            <div>
                <SubmitButton pending={pending}>{pending ? "Changing…" : "Change password"}</SubmitButton>
            </div>
        </form>
    );
}
