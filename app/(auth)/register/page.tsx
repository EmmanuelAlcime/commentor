import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getCurrentUser } from "@/features/auth/di";
import { safeCallbackURL } from "@/features/auth/presentation/callback-url";
import { AuthCard } from "@/features/auth/presentation/components/AuthCard";
import { RegisterForm } from "@/features/auth/presentation/components/RegisterForm";

export const metadata: Metadata = { title: "Sign up" };

export default function RegisterPage({ searchParams }: PageProps<"/register">) {
    return (
        <AuthCard title="Create an account" description="Sign up to comment on posts.">
            <Suspense fallback={<div className="h-96" />}>
                <Register searchParams={searchParams} />
            </Suspense>
        </AuthCard>
    );
}

async function Register({ searchParams }: Pick<PageProps<"/register">, "searchParams">) {
    const callbackURL = safeCallbackURL((await searchParams).callbackURL);
    if (await getCurrentUser()) redirect(callbackURL);
    return <RegisterForm callbackURL={callbackURL} />;
}
