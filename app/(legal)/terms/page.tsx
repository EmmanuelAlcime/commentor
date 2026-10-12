import type { Metadata } from "next";
import { UserAgreement } from "@/features/auth/presentation/components/UserAgreement";

export const metadata: Metadata = { title: "User Agreement" };

export default function TermsPage() {
    return <UserAgreement />;
}
