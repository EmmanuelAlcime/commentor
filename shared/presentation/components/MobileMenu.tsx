"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Icon, type IconName } from "./ui/Icon";

export type NavLink = { href: string; label: string; icon: IconName };
// `actions` is server-rendered content (the user menu), shown below the links
type Props = { links: NavLink[]; actions?: ReactNode };

// Matches Tailwind's `md` breakpoint, where the desktop links take over
const DESKTOP_QUERY = "(min-width: 48rem)";

const subscribeNoop = () => () => {};

const MobileMenu = ({ links, actions }: Props) => {
    const [open, setOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const firstLinkRef = useRef<HTMLAnchorElement>(null);
    const menuId = useId();
    // The portal needs `document`, which only exists after hydration
    const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);

    useEffect(() => {
        if (!open) return;

        firstLinkRef.current?.focus();
        document.body.style.overflow = "hidden";

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setOpen(false);
                buttonRef.current?.focus();
            }
        };
        // Close if the viewport grows past the breakpoint while the menu is open
        const desktop = window.matchMedia(DESKTOP_QUERY);
        const onChange = (event: MediaQueryListEvent) => {
            if (event.matches) setOpen(false);
        };

        document.addEventListener("keydown", onKeyDown);
        desktop.addEventListener("change", onChange);
        return () => {
            document.body.style.overflow = "";
            document.removeEventListener("keydown", onKeyDown);
            desktop.removeEventListener("change", onChange);
        };
    }, [open]);

    const barClass =
        "absolute left-0 block h-0.5 w-5 rounded-full bg-current transition duration-300 ease-in-out";

    return (
        <>
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-expanded={open}
                aria-controls={menuId}
                aria-label={open ? "Close menu" : "Open menu"}
                className="relative ml-1 inline-flex h-9 w-9 items-center justify-center rounded-md text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900 md:hidden dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
            >
                <span aria-hidden="true" className="relative block h-3.5 w-5">
                    <span className={`${barClass} top-0 ${open ? "translate-y-1.5 rotate-45" : ""}`} />
                    <span className={`${barClass} top-1.5 ${open ? "scale-x-0 opacity-0" : ""}`} />
                    <span className={`${barClass} top-3 ${open ? "-translate-y-1.5 -rotate-45" : ""}`} />
                </span>
            </button>

            {/* Portalled to <body> because the header's backdrop-blur would otherwise trap `fixed` children.
                It sits below the header's z-10, so the button stays visible to toggle back to the hamburger. */}
            {mounted &&
                createPortal(
                    <div id={menuId} inert={!open} className="md:hidden">
                        <div
                            aria-hidden="true"
                            onClick={() => setOpen(false)}
                            className={`fixed inset-0 z-[5] bg-zinc-950/40 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
                        />
                        <nav
                            aria-label="Mobile"
                            className={`fixed inset-x-0 top-16 z-[5] border-b border-zinc-200 bg-white shadow-lg transition duration-300 ease-out dark:border-zinc-800 dark:bg-zinc-950 ${open ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-4 opacity-0"}`}
                        >
                            <ul className="flex flex-col gap-1 px-4 py-4 sm:px-6">
                                {links.map((link, index) => (
                                    <li key={link.label}>
                                        <Link
                                            ref={index === 0 ? firstLinkRef : undefined}
                                            href={link.href}
                                            onClick={() => setOpen(false)}
                                            className="flex items-center gap-3 rounded-md px-3 py-3 text-base font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                                        >
                                            <Icon name={link.icon} />
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                            {actions && (
                                // Clicks bubble up from the auth links/buttons inside, closing the menu on navigation
                                <div
                                    onClick={() => setOpen(false)}
                                    className="border-t border-zinc-200 px-4 py-4 sm:px-6 dark:border-zinc-800"
                                >
                                    {actions}
                                </div>
                            )}
                        </nav>
                    </div>,
                    document.body,
                )}
        </>
    );
};
export default MobileMenu;
