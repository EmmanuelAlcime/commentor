import Link from "next/link";
import type { ReactNode } from "react";

const navLinks = [
    { href: "/", label: "Home" },
    // Placeholder links until the About and Contact pages exist
    { href: "#", label: "About" },
    { href: "#", label: "Contact" },
];

// `actions` is a slot for the signed-in user menu, so shared code does not depend on the auth feature
const Header = ({ actions }: { actions?: ReactNode }) => {
    return (
        <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
            <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href="/" className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                    Commenter
                </Link>
                <ul className="ml-auto mr-2 flex items-center gap-1 sm:mr-4 sm:gap-2">
                    {navLinks.map((link) => (
                        <li key={link.label}>
                            <Link
                                href={link.href}
                                className="rounded-md px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                            >
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>
                {actions}
            </nav>
        </header>
    );
};
export default Header;
