const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

const sameYear = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
const otherYear = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

// Compact age like "now", "15m", "3h", "2d", "4w", then a date ("Jan 4", or "Jan 4, 2025" in another year)
export function formatRelativeTime(date: Date, now: Date = new Date()): string {
    const elapsed = now.getTime() - date.getTime();

    if (elapsed < MINUTE) return "now";
    if (elapsed < HOUR) return `${Math.floor(elapsed / MINUTE)}m`;
    if (elapsed < DAY) return `${Math.floor(elapsed / HOUR)}h`;
    if (elapsed < WEEK) return `${Math.floor(elapsed / DAY)}d`;
    if (elapsed < 5 * WEEK) return `${Math.floor(elapsed / WEEK)}w`;

    return (date.getFullYear() === now.getFullYear() ? sameYear : otherYear).format(date);
}
