export type User = {
    id: string;
    email: string;
    createdTimestamp: number;
    attributes: Record<string, string[]>;
    emailVerified: boolean;
};
