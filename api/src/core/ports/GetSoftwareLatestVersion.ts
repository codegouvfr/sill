export type GetSoftwareLatestVersion = {
    (repoUrl: string, strategy: "quick" | "look everywhere"): Promise<
        { semVer: string; publicationTime: number } | undefined
    >;
    clear: (repoUrl: string) => void;
};
