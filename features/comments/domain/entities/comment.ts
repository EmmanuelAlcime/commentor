export type Comment = {
    id: number;
    postId: number | null;
    userId: number | null;
    content: string | null;
    createdAt: Date | null;
};
