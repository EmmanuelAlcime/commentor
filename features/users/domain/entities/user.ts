// Password is deliberately excluded: it never leaves the data layer
export type User = {
    id: number;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    age: number | null;
};
