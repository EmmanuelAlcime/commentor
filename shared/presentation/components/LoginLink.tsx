"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// Sends signed-out users to log in, then back to the page they were on
export function LoginLink({ className, children, label }: { className?: string; children: ReactNode; label?: string }) {
    const pathname = usePathname();
    const href = pathname === "/" ? "/login" : `/login?callbackURL=${encodeURIComponent(pathname)}`;

    return (
        <Link href={href} className={className} aria-label={label}>
            {children}
        </Link>
    );
}
