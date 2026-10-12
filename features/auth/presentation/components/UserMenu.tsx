import Link from "next/link";
import { getCurrentUser } from "@/features/auth/di";
import { Avatar } from "@/shared/presentation/components/ui/Avatar";
import { Icon } from "@/shared/presentation/components/ui/Icon";
import { signOutAction } from "../actions/auth-actions";

// "bar" sits inline in the header; "menu" stacks full-width inside the mobile overlay
type Variant = "bar" | "menu";

const styles: Record<Variant, { wrapper: string; link: string; primary: string; name: string; avatar: string; icon: string }> = {
    bar: {
        wrapper: "flex items-center gap-1 sm:gap-2",
        link: "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50",
        primary:
            "flex items-center gap-2 rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300",
        name: "flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100 dark:text-zinc-50 dark:hover:bg-zinc-800",
        avatar: "size-7 text-xs",
        icon: "size-4",
    },
    menu: {
        wrapper: "flex flex-col gap-2",
        link: "flex w-full items-center gap-3 rounded-md px-3 py-3 text-base font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50",
        primary:
            "flex w-full items-center gap-3 rounded-md bg-zinc-900 px-3 py-3 text-base font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300",
        name: "flex w-full items-center gap-3 rounded-md px-3 py-3 text-base font-medium text-zinc-900 transition hover:bg-zinc-100 dark:text-zinc-50 dark:hover:bg-zinc-800",
        avatar: "size-8 text-xs",
        icon: "size-5",
    },
};

// Reads the session, so it must be rendered inside a <Suspense> boundary
export async function UserMenu({ variant = "bar" }: { variant?: Variant }) {
    const user = await getCurrentUser();
    const s = styles[variant];

    if (!user) {
        return (
            <div className={s.wrapper}>
                <Link href="/login" className={s.link}>
                    <Icon name="log-in" className={s.icon} />
                    Log in
                </Link>
                <Link href="/register" className={s.primary}>
                    <Icon name="user-plus" className={s.icon} />
                    Sign up
                </Link>
            </div>
        );
    }

    return (
        <div className={s.wrapper}>
            <Link href="/profile" className={s.name} aria-label={`${user.name}: your profile`}>
                <Avatar name={user.name} src={user.image} className={s.avatar} />
                <span className={variant === "bar" ? "hidden max-w-40 truncate sm:inline" : "truncate"}>{user.name}</span>
            </Link>
            <form action={signOutAction}>
                <button type="submit" className={s.link}>
                    <Icon name="log-out" className={s.icon} />
                    Log out
                </button>
            </form>
        </div>
    );
}
