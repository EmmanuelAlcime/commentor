import Link from "next/link";
import type { ReactNode } from "react";
import MobileMenu, { type NavLink } from "./MobileMenu";
import { Icon } from "./ui/Icon";

const navLinks: NavLink[] = [
    { href: "/", label: "Home", icon: "home" },
    // Placeholder links until the About and Contact pages exist
    { href: "#", label: "About", icon: "info" },
    { href: "#", label: "Contact", icon: "mail" },
];

// `actions` and `mobileActions` are slots for the signed-in user menu, so shared code does not depend on the auth feature.
// `actions` shows in the bar from `md` up; `mobileActions` shows inside the overlay below it.
const Header = ({ actions, mobileActions }: { actions?: ReactNode; mobileActions?: ReactNode }) => {
    return (
        <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
            <nav className="mx-auto flex h-16 w-full max-w-6xl items-center px-4 sm:px-6 lg:px-8">
                <Link href="/" className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                    Commenter
                </Link>
                <ul className="ml-auto mr-4 hidden items-center gap-2 md:flex">
                    {navLinks.map((link) => (
                        <li key={link.label}>
                            <Link
                                href={link.href}
                                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                            >
                                <Icon name={link.icon} className="size-4" />
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>
                <div className="ml-auto flex items-center md:ml-0">
                    <div className="hidden md:block">{actions}</div>
                    <MobileMenu links={navLinks} actions={mobileActions} />
                </div>
            </nav>
        </header>
    );
};
export default Header;
