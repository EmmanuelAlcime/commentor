import Link from "next/link";
import { Icon } from "@/shared/presentation/components/ui/Icon";

export type BreadcrumbItem = { label: string; href?: string };

// The last item is the current page and is never rendered as a link.
export function Breadcrumbs({ items, className = "" }: { items: BreadcrumbItem[]; className?: string }) {
    if (items.length === 0) return null;

    return (
        <nav aria-label="Breadcrumb" className={className}>
            <ol className="flex min-w-0 items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                {items.map((item, index) => {
                    const isCurrent = index === items.length - 1;

                    return (
                        <li key={`${index}-${item.label}`} className={`flex items-center gap-1.5 ${isCurrent ? "min-w-0" : "shrink-0"}`}>
                            {index > 0 && <Icon name="chevron-right" className="size-3.5 shrink-0 text-zinc-400 dark:text-zinc-600" />}
                            {isCurrent || !item.href ? (
                                <span
                                    aria-current={isCurrent ? "page" : undefined}
                                    className={isCurrent ? "truncate font-medium text-zinc-900 dark:text-zinc-100" : undefined}
                                >
                                    {item.label}
                                </span>
                            ) : (
                                <Link
                                    href={item.href}
                                    className="rounded transition hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:hover:text-zinc-100 dark:focus-visible:outline-zinc-100"
                                >
                                    {item.label}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
