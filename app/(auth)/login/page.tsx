import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getCurrentUser } from "@/features/auth/di";
import { safeCallbackURL } from "@/features/auth/presentation/callback-url";
import { AuthCard } from "@/features/auth/presentation/components/AuthCard";
import { LoginForm } from "@/features/auth/presentation/components/LoginForm";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage({ searchParams }: PageProps<"/login">) {
    return (
        <AuthCard title="Log in" description="Welcome back. Log in to join the conversation.">
            <Suspense fallback={<div className="h-56" />}>
                <Login searchParams={searchParams} />
            </Suspense>
        </AuthCard>
    );
}

async function Login({ searchParams }: Pick<PageProps<"/login">, "searchParams">) {
    const callbackURL = safeCallbackURL((await searchParams).callbackURL);
    if (await getCurrentUser()) redirect(callbackURL);
    return <LoginForm callbackURL={callbackURL} />;
}
