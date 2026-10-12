// The user agreement shown at /terms and linked from the registration form.
// Plain content: edit the sections here when the terms change.
export const USER_AGREEMENT_EFFECTIVE_DATE = "October 12, 2026";

const sections: { title: string; paragraphs: string[] }[] = [
    {
        title: "1. Your account",
        paragraphs: [
            "You must provide a valid email address and keep your password private. You are responsible for everything done with your account, so tell us right away if you think someone else has access to it.",
            "You can change your name, email address, password and profile picture, and delete your account at any time from your profile page.",
        ],
    },
    {
        title: "2. Comments and content",
        paragraphs: [
            "You keep ownership of the comments you post. By posting, you give Commenter a non-exclusive, worldwide licence to display them alongside the post they belong to and in your public comment history.",
            "Do not post content that is unlawful, harassing, hateful, pornographic, deceptive, or that infringes someone else's rights. We may remove content that breaks these rules and may suspend accounts that repeatedly do so.",
        ],
    },
    {
        title: "3. Profile pictures",
        paragraphs: [
            "Profile pictures are public. Only upload images you have the right to use and that follow the content rules above. We may remove a picture that breaks these rules.",
        ],
    },
    {
        title: "4. Your data",
        paragraphs: [
            "We store your name, email address, password (hashed), profile picture, comments and likes to run the service. We do not sell your data.",
            "Deleting your account permanently removes your profile, picture, comments and likes. This cannot be undone.",
        ],
    },
    {
        title: "5. Changes to this agreement",
        paragraphs: [
            "We may update this agreement from time to time. When we do, we will change the effective date above. Continuing to use Commenter after a change means you accept the updated agreement.",
        ],
    },
    {
        title: "6. No warranty",
        paragraphs: [
            "Commenter is provided as is, without warranties of any kind. To the extent allowed by law, we are not liable for any loss arising from your use of the service.",
        ],
    },
];

export function UserAgreement() {
    return (
        <article className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">User Agreement</h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Effective {USER_AGREEMENT_EFFECTIVE_DATE}</p>
            <p className="mt-6 text-zinc-700 dark:text-zinc-300">
                This agreement covers your use of Commenter. By creating an account you agree to it, so please read it before you sign up.
            </p>
            {sections.map((section) => (
                <section key={section.title} className="mt-8">
                    <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{section.title}</h2>
                    {section.paragraphs.map((paragraph) => (
                        <p key={paragraph} className="mt-3 leading-relaxed text-zinc-700 dark:text-zinc-300">
                            {paragraph}
                        </p>
                    ))}
                </section>
            ))}
        </article>
    );
}
