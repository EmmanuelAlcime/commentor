import Link from "next/link";
import { getCurrentUser } from "@/features/auth/di";
import { signOutAction } from "../actions/auth-actions";

const linkClass =
    "rounded-md px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50";
const primaryClass =
    "rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300";

// Reads the session, so it must be rendered inside a <Suspense> boundary
export async function UserMenu() {
    const user = await getCurrentUser();

    if (!user) {
        return (
            <div className="flex items-center gap-1 sm:gap-2">
                <Link href="/login" className={linkClass}>Log in</Link>
                <Link href="/register" className={primaryClass}>Sign up</Link>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1 sm:gap-2">
            <span className="hidden px-3 text-sm font-medium text-zinc-900 sm:inline dark:text-zinc-50">{user.name}</span>
            <form action={signOutAction}>
                <button type="submit" className={linkClass}>Log out</button>
            </form>
        </div>
    );
}
