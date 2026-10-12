"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/shared/presentation/components/ui/Icon";

const tabs: { href: string; label: string; icon: IconName }[] = [
    { href: "/profile", label: "Comments", icon: "chat" },
    { href: "/profile/settings", label: "Settings", icon: "cog" },
];

export function ProfileNav() {
    const pathname = usePathname();

    return (
        <nav aria-label="Profile" className="border-b border-zinc-200 dark:border-zinc-800">
            <ul className="-mb-px flex gap-2">
                {tabs.map((tab) => {
                    const current = pathname === tab.href;
                    return (
                        <li key={tab.href}>
                            <Link
                                href={tab.href}
                                aria-current={current ? "page" : undefined}
                                className={`flex items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium transition ${
                                    current
                                        ? "border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-50"
                                        : "border-transparent text-zinc-600 hover:border-zinc-300 hover:text-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-50"
                                }`}
                            >
                                <Icon name={tab.icon} className="size-4" />
                                {tab.label}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
