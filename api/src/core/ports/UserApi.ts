export type UserApi = {
    updateUserEmail: (params: { userId: string; email: string }) => Promise<void>;
    getAllowedEmailRegexp: {
        (): Promise<string>;
        clear: () => void;
    };
    getUserCount: {
        (): Promise<number>;
        clear: () => void;
    };
};
