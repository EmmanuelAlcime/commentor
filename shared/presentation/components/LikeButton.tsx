"use client";

import { useOptimistic, useTransition } from "react";
import { Icon } from "@/shared/presentation/components/ui/Icon";
import { LoginLink } from "./LoginLink";

type Size = "md" | "sm";

const styles: Record<Size, { base: string; idle: string; liked: string; icon: string }> = {
    md: {
        base: "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium",
        idle: "border-zinc-200 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800",
        liked: "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-300 dark:hover:bg-sky-900",
        icon: "size-5",
    },
    sm: {
        base: "inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-sm font-medium",
        idle: "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50",
        liked: "text-sky-700 hover:bg-sky-50 dark:text-sky-300 dark:hover:bg-sky-950",
        icon: "size-4",
    },
};

const focusRing = "transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:focus-visible:outline-zinc-100";

const likesLabel = (count: number) => `${count} ${count === 1 ? "like" : "likes"}`;

type Props = {
    count: number;
    liked: boolean;
    signedIn: boolean;
    // Server action that saves the new state; it should refresh the page so the props catch up
    action: (liked: boolean) => Promise<void>;
    // What is being liked, for screen readers: "this post", "Ada's comment"
    subject: string;
    size?: Size;
};

// Flips instantly and shows the new count while the server catches up; reverts if the action fails
export function LikeButton({ count, liked, signedIn, action, subject, size = "md" }: Props) {
    const [optimistic, setOptimistic] = useOptimistic({ count, liked });
    const [, startTransition] = useTransition();
    const s = styles[size];

    if (!signedIn) {
        return (
            <LoginLink className={`${s.base} ${s.idle} ${focusRing}`} label={`Log in to like ${subject} (${likesLabel(count)})`}>
                <Icon name="thumb-up" className={s.icon} />
                {count > 0 && count}
            </LoginLink>
        );
    }

    const toggle = () => {
        const next = { liked: !optimistic.liked, count: Math.max(0, optimistic.count + (optimistic.liked ? -1 : 1)) };
        startTransition(async () => {
            setOptimistic(next);
            await action(next.liked);
        });
    };

    return (
        <button
            type="button"
            onClick={toggle}
            aria-pressed={optimistic.liked}
            aria-label={`Like ${subject} (${likesLabel(optimistic.count)})`}
            className={`${s.base} ${optimistic.liked ? s.liked : s.idle} ${focusRing}`}
        >
            <Icon name="thumb-up" className={s.icon} fill={optimistic.liked ? "currentColor" : "none"} />
            {optimistic.count > 0 && optimistic.count}
        </button>
    );
}
