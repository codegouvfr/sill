import { listTagsFactory } from "./listTags";
import type { Octokit } from "@octokit/rest";
import { NpmModuleVersion } from "../NpmModuleVersion";

export function getLatestSemVersionedTagFactory(params: { octokit: Octokit }) {
    const { octokit } = params;

    async function getLatestSemVersionedTag(params: { owner: string; repo: string; doIgnoreBeta: boolean }): Promise<
        | {
              tag: string;
              version: NpmModuleVersion | undefined;
          }
        | undefined
    > {
        const { owner, repo, doIgnoreBeta } = params;

        const semVersionedTags: { tag: string; version: NpmModuleVersion | undefined }[] = [];

        const { listTags } = listTagsFactory({ octokit });

        let tagsAlreadyListed = 0;

        for await (const tag of listTags({ owner, repo })) {
            if (tagsAlreadyListed === 15) {
                break;
            }

            tagsAlreadyListed++;

            let version: NpmModuleVersion | undefined;

            if (!(tag.includes(".") && /\d/.test(tag))) {
                continue;
            }

            try {
                version = NpmModuleVersion.parse(tag.replace(/^[vV]?/, ""));
            } catch {
                version = undefined;
            }

            if (doIgnoreBeta && version !== undefined && version.betaPreRelease !== undefined) {
                continue;
            }

            semVersionedTags.push({ tag, version });
        }

        return semVersionedTags[0];
    }

    return { getLatestSemVersionedTag };
}
