import type { User } from "api";

export type GetUser = () => Promise<User>;
export type { User };
