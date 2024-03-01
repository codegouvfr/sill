import type { GetSoftwareLatestVersion } from "../ports/GetSoftwareLatestVersion";
import { getLatestSemVersionedTagFromSourceUrl } from "../../tools/getLatestSemVersionedTagFromSourceUrl";

export function createGetSoftwareLatestVersion(params: { githubPersonalAccessTokenForApiRateLimit: string }): {
    getSoftwareLatestVersion: GetSoftwareLatestVersion;
} {
    const { githubPersonalAccessTokenForApiRateLimit } = params;

    const cacheQuick = new Map<string, Promise<{ semVer: string; publicationTime: number } | undefined>>();
    const cacheLookEverywhere = new Map<string, Promise<{ semVer: string; publicationTime: number } | undefined>>();

    async function getSoftwareLatestVersion(
        repoUrl: string,
        strategy: "quick" | "look everywhere"
    ): Promise<{ semVer: string; publicationTime: number } | undefined> {
        {
            let cachedPr: Promise<{ semVer: string; publicationTime: number } | undefined> | undefined = undefined;

            cachedPr = cacheLookEverywhere.get(repoUrl);

            if (cachedPr !== undefined) {
                return cachedPr;
            }

            if (strategy === "quick") {
                cachedPr = cacheQuick.get(repoUrl);
                if (cachedPr !== undefined) {
                    return cachedPr;
                }
            }
        }

        const pr = (async () => {
            const resp = await getLatestSemVersionedTagFromSourceUrl({
                githubPersonalAccessTokenForApiRateLimit,
                "sourceUrl": repoUrl,
                "isQuick": (() => {
                    switch (strategy) {
                        case "look everywhere":
                            return false;
                        case "quick":
                            return true;
                    }
                })()
            });

            if (resp === undefined) {
                return undefined;
            }

            const { version, publicationTime } = resp;

            return {
                "semVer": version,
                publicationTime
            };
        })();

        switch (strategy) {
            case "look everywhere":
                cacheLookEverywhere.set(repoUrl, pr);
                break;
            case "quick":
                cacheQuick.set(repoUrl, pr);
                break;
        }

        return pr;
    }

    getSoftwareLatestVersion.clear = (repoUrl: string) => {
        cacheLookEverywhere.delete(repoUrl);
        cacheQuick.delete(repoUrl);
    };

    return { getSoftwareLatestVersion };
}
