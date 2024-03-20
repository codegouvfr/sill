export type UserApi = {
    updateUserOrganization: (params: { userId: string; organization: string }) => Promise<void>;
    updateUserEmail: (params: { userId: string; email: string }) => Promise<void>;
    getAllowedEmailRegexp: {
        (): Promise<string>;
        clear: () => void;
    };
    getAllOrganizations: {
        (): Promise<string[]>;
        clear: () => void;
    };
    getUserCount: {
        (): Promise<number>;
        clear: () => void;
    };
};
