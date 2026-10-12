import { db } from './index';
import { commentsTable, postTable, userTable } from './schema';

const USER_COUNT = 100;
const POST_COUNT = 100;
const COMMENT_COUNT = 200;

// Seeded PRNG so every run produces the same data
let state = 42;
const random = () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
};
const pick = <T>(items: readonly T[]): T => items[Math.floor(random() * items.length)];
const between = (min: number, max: number) => min + Math.floor(random() * (max - min + 1));

const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'David', 'Elizabeth', 'William', 'Sarah', 'Richard', 'Karen', 'Joseph', 'Nancy', 'Thomas', 'Lisa', 'Daniel', 'Emma'] as const;
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Martin', 'Lee', 'Clark', 'Lewis', 'Walker'] as const;
const adjectives = ['Practical', 'Simple', 'Modern', 'Hidden', 'Essential', 'Quick', 'Ultimate', 'Honest', 'Surprising', 'Complete'] as const;
const topics = ['TypeScript', 'React', 'MySQL', 'Next.js', 'Drizzle ORM', 'CSS Grid', 'Testing', 'Remote Work', 'Productivity', 'Open Source'] as const;
const formats = ['Guide to', 'Tips for', 'Lessons from', 'Thoughts on', 'Introduction to'] as const;
const sentences = [
    'This changed the way I think about building apps.',
    'Here is what I learned after a year of using it in production.',
    'Most people overlook the basics, so let us start there.',
    'The trade-offs are worth understanding before you commit.',
    'A small change in approach can save hours every week.',
    'I tried several alternatives before settling on this one.',
] as const;
const commentLines = [
    'Great post, thanks for sharing!',
    'This was exactly what I needed today.',
    'I disagree with the second point, but well written.',
    'Could you write a follow-up on this?',
    'Bookmarked for later.',
    'Clear and to the point. Nice work.',
    'I ran into the same issue last week.',
    'Any recommendations for further reading?',
    'This helped me fix a bug in my project.',
    'Interesting perspective, I had not considered that.',
] as const;

const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString();
const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const users = Array.from({ length: USER_COUNT }, (_, i) => {
    const id = i + 1;
    const firstName = pick(firstNames);
    const lastName = pick(lastNames);
    return {
        id,
        username: `${firstName}.${lastName}${id}`.toLowerCase(),
        // Placeholder only: not hashed, never use real passwords in seed data
        password: 'password123',
        firstName,
        lastName,
        email: `${firstName}.${lastName}${id}@example.com`.toLowerCase(),
        age: between(18, 70),
    };
});

const posts = Array.from({ length: POST_COUNT }, (_, i) => {
    const id = i + 1;
    const title = `${pick(adjectives)} ${pick(formats)} ${pick(topics)}`;
    const createdAt = daysAgo(between(1, 365));
    return {
        id,
        title,
        content: `${pick(sentences)} ${pick(sentences)}`,
        slug: `${slugify(title)}-${id}`,
        image: `https://picsum.photos/seed/post-${id}/800/400`,
        date: createdAt.slice(0, 10),
        createdAt,
    };
});

const comments = Array.from({ length: COMMENT_COUNT }, (_, i) => ({
    id: i + 1,
    postId: between(1, POST_COUNT),
    userId: between(1, USER_COUNT),
    content: pick(commentLines),
    createdAt: daysAgo(between(0, 30)),
}));

async function main() {
    console.log('Clearing existing data...');
    await db.delete(commentsTable);
    await db.delete(postTable);
    await db.delete(userTable);

    console.log('Seeding...');
    await db.insert(userTable).values(users);
    await db.insert(postTable).values(posts);
    await db.insert(commentsTable).values(comments);

    console.log(`Seeded ${users.length} users, ${posts.length} posts, ${comments.length} comments`);
}

main()
    .then(() => process.exit(0))
    .catch((error: unknown) => {
        console.error('Seed failed:', error);
        process.exit(1);
    });
