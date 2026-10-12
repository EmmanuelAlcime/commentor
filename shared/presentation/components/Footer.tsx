import { cacheLife } from "next/cache";

// Cached so `new Date()` is allowed during prerendering with cacheComponents
const Footer = async () => {
    "use cache";
    cacheLife("days");

    const year = new Date().getFullYear();

    return (
        <footer className="border-t border-zinc-200 dark:border-zinc-800">
            <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-8 text-sm text-zinc-500 sm:flex-row sm:px-6 lg:px-8 dark:text-zinc-400">
                <p className="font-semibold text-zinc-900 dark:text-zinc-50">Commenter</p>
                <p>&copy; {year} Commenter. All rights reserved.</p>
            </div>
        </footer>
    );
};
export default Footer;
