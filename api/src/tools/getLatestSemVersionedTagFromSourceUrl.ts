import { parseGitHubRepoUrl } from "./parseGithubRepoUrl";
import { listTagsFactory } from "./octokit-addons/listTags";
import { Octokit } from "@octokit/rest";
import * as semver from "semver";
import parseSemver from "semver/functions/parse";
import { exclude } from "tsafe/exclude";
import { id } from "tsafe/id";
import { assert } from "tsafe/assert";
import { graphql } from "@octokit/graphql";
import fetch from "node-fetch";

/** NOTE: This function can't throw */
export async function getLatestSemVersionedTagFromSourceUrl(params: {
    sourceUrl: string;
    githubPersonalAccessTokenForApiRateLimit: string | undefined;
    isQuick: boolean;
}): Promise<{ version: string; publicationTime: number } | undefined> {
    const { sourceUrl, githubPersonalAccessTokenForApiRateLimit, isQuick } = params;

    let parsedGitHubRepoUrl: ReturnType<typeof parseGitHubRepoUrl>;

    try {
        parsedGitHubRepoUrl = parseGitHubRepoUrl(sourceUrl);
    } catch {
        return undefined;
    }

    const octokit = new Octokit({ "auth": githubPersonalAccessTokenForApiRateLimit, "request": { fetch } });

    if (githubPersonalAccessTokenForApiRateLimit === undefined) {
        return undefined;
    }

    const tags = isQuick
        ? []
        : await (async () => {
              const tags: string[] = [];

              const { listTags } = listTagsFactory({
                  octokit
              });

              const asyncIterator = listTags({
                  "owner": parsedGitHubRepoUrl.owner,
                  "repo": parsedGitHubRepoUrl.repoName
              });

              const start = Date.now();

              async_iter: for await (const tag of asyncIterator) {
                  if (Date.now() - start > 30 * 1000) {
                      console.log(`Listing ${sourceUrl} tags with octokit REST is taking too long, aborting...`);
                      return [];
                  }

                  for (const search of ["rc.", "alpha", "beta", "nightly", "canary", "pre", "wip", "next."]) {
                      if (tag.toLowerCase().includes(search)) {
                          continue async_iter;
                      }
                  }

                  if (/rc[0-9]/.test(tag)) {
                      continue;
                  }

                  tags.push(tag);
              }

              return tags;
          })().catch(() => id<string[]>([]));

    const semverTags_valid: { tag: string; version: string }[] = tags
        .map(tag => {
            const version = semver.valid(tag);

            if (version === null) {
                return undefined;
            }

            return {
                tag,
                version
            };
        })
        .filter(exclude(undefined))
        .sort((a, b) => semver.compare(a.version, b.version));

    const semverTags_coerce = tags
        .filter(tag => !semverTags_valid.map(({ tag }) => tag).includes(tag))
        .map(tag => {
            const version = semver.valid(semver.coerce(tag));

            if (version === null) {
                return undefined;
            }

            {
                const parsedVersion = parseSemver(version);

                assert(parsedVersion !== null);

                if (
                    parsedVersion.patch === 0 &&
                    parsedVersion.minor === 0 &&
                    !tag
                        .replace(/^[^0-9]*/, "")
                        .replace(/[^0-9.]/g, "")
                        .includes(".")
                ) {
                    return undefined;
                }
            }

            return {
                tag,
                version
            };
        })
        .filter(exclude(undefined))
        .sort((a, b) => semver.compare(a.version, b.version));

    const [latestSemverTag_valid, latestSemverTag_coerce] = await Promise.all(
        ([semverTags_valid, semverTags_coerce] as const).map(async entries => {
            if (entries.length === 0) {
                return undefined;
            }

            const { tag, version } = entries[entries.length - 1];

            const date = await getTagDate({
                "owner": parsedGitHubRepoUrl.owner,
                "repo": parsedGitHubRepoUrl.repoName,
                tag,
                octokit
            });

            if (date === null) {
                return undefined;
            }

            return {
                version,
                tag,
                date
            } as const;
        })
    );

    const latestSemverTag = (() => {
        if (latestSemverTag_valid === undefined) {
            if (latestSemverTag_coerce === undefined) {
                return undefined;
            }

            return latestSemverTag_coerce;
        }

        if (latestSemverTag_coerce === undefined) {
            return latestSemverTag_valid;
        }

        if (latestSemverTag_coerce.date.getTime() - latestSemverTag_valid.date.getTime() > 2 * 24 * 3600 * 1000) {
            return latestSemverTag_coerce;
        }

        return latestSemverTag_valid;
    })();

    const latestReleaseInfo = await getLatestReleaseInfo({
        "owner": parsedGitHubRepoUrl.owner,
        "repo": parsedGitHubRepoUrl.repoName,
        octokit
    });

    if (
        latestReleaseInfo !== undefined &&
        (latestSemverTag === undefined ||
            latestReleaseInfo.publishedAt.getTime() - latestSemverTag.date.getTime() >
                /* three month */ 3 * 30 * 24 * 3600 * 1000)
    ) {
        //console.log(`${sourceUrl} Returning release: ${JSON.stringify(latestReleaseInfo, null, 2)}`);
        return {
            "version": latestReleaseInfo.tag,
            "publicationTime": latestReleaseInfo.publishedAt.getTime()
        };
    }

    const allTagsWithDates =
        tags.length === 0
            ? null
            : await getAllTagsWithDatesUsingGraphQLApi({
                  "owner": parsedGitHubRepoUrl.owner,
                  "name": parsedGitHubRepoUrl.repoName,
                  "githubToken": githubPersonalAccessTokenForApiRateLimit
              });

    if (allTagsWithDates !== null) {
        const latestTagWithDate = allTagsWithDates
            //sort by date, the most recent first
            .sort((a, b) => b.date.getTime() - a.date.getTime())[0];

        if (
            latestTagWithDate !== undefined &&
            (latestSemverTag === undefined ||
                latestTagWithDate.date.getTime() - latestSemverTag.date.getTime() >
                    /* three month */ 3 * 30 * 24 * 3600 * 1000)
        ) {
            //console.log(`${sourceUrl} Returning GraphQL result: ${JSON.stringify(latestTagWithDate, null, 2)}`);
            return {
                "version": latestTagWithDate.name,
                "publicationTime": latestTagWithDate.date.getTime()
            };
        }
    }

    if (latestSemverTag === undefined) {
        return undefined;
    }

    //console.log(`${sourceUrl} Returning: ${JSON.stringify(latestSemverTag, null, 2)}`);
    return {
        "version": latestSemverTag.version,
        "publicationTime": latestSemverTag.date.getTime()
    };
}

async function getTagDate(params: {
    owner: string;
    repo: string;
    tag: string;
    octokit: Octokit;
}): Promise<Date | null> {
    const { owner, repo, tag, octokit } = params;
    try {
        // Fetch the tag
        const tagRef = await octokit.git.getRef({
            owner,
            repo,
            "ref": `tags/${tag}`
        });

        // If tag is an annotated tag, it will have its own date, otherwise fetch the commit associated with the tag
        if (tagRef.data.object.type === "tag") {
            const tag = await octokit.git.getTag({
                owner,
                repo,
                tag_sha: tagRef.data.object.sha
            });
            return new Date(tag.data.tagger.date);
        } else if (tagRef.data.object.type === "commit") {
            const commit = await octokit.git.getCommit({
                owner,
                repo,
                commit_sha: tagRef.data.object.sha
            });
            return new Date(commit.data.author.date);
        }
    } catch (error) {
        console.error(`Failed to get the date for tag ${tag} in repo ${owner}/${repo}:`, error);
    }

    return null;
}

async function getLatestReleaseInfo(params: { owner: string; repo: string; octokit: Octokit }): Promise<
    | {
          tag: string;
          publishedAt: Date;
      }
    | undefined
> {
    const { owner, repo, octokit } = params;

    try {
        const { data: releases } = await octokit.repos.listReleases({
            owner,
            repo,
            per_page: 1,
            page: 1
        });

        if (releases.length > 0) {
            const tag = releases[0]?.tag_name;

            assert(typeof tag === "string");

            const publishedAtStr = releases[0]?.published_at;

            assert(typeof publishedAtStr === "string");

            return {
                tag,
                publishedAt: new Date(publishedAtStr)
            };
        } else {
            return undefined;
        }
    } catch (error) {
        console.error(`Error fetching the latest release:${String(error)}`);
        return undefined;
    }
}

// NOTE: GPT generated
const getAllTagsWithDatesUsingGraphQLApi = async (params: { owner: string; name: string; githubToken: string }) => {
    const { owner, name, githubToken } = params;

    const query = `
    query($owner: String!, $name: String!, $after: String) {
      repository(owner: $owner, name: $name) {
        refs(refPrefix: "refs/tags/", first: 100, after: $after, orderBy: {field: TAG_COMMIT_DATE, direction: DESC}) {
          nodes {
            name
            target {
              ... on Tag {
                tagger {
                  date
                }
              }
            }
          }
          pageInfo {
            endCursor
            hasNextPage
          }
        }
      }
    }
  `;

    let tagsWithDates: { name: string; date: Date }[] = [];
    let hasNextPage = true;
    let afterCursor: string | undefined;

    const start = Date.now();

    try {
        while (hasNextPage) {
            if (Date.now() - start > 30 * 1000) {
                console.log(`Listing ${owner}/${name} tags with octokit GraphQL is taking too long, aborting...`);
                return null;
            }

            const data: any = await graphql(query, {
                "headers": {
                    "authorization": `token ${githubToken}`
                },
                "request": {
                    fetch
                },
                owner,
                name,
                "after": afterCursor
            });

            const newTags = (data.repository.refs.nodes as any[])
                .map((node: any) => {
                    const date = node.target.tagger ? new Date(node.target.tagger.date) : undefined;

                    if (date == undefined) {
                        return undefined;
                    }

                    return {
                        name: node.name,
                        date
                    };
                })
                .filter(exclude(undefined));

            tagsWithDates = [...tagsWithDates, ...newTags];

            hasNextPage = data.repository.refs.pageInfo.hasNextPage;
            afterCursor = data.repository.refs.pageInfo.endCursor;
        }

        if (tagsWithDates.length === 0) {
            return null;
        }

        return tagsWithDates;
    } catch (error) {
        console.error(`An error occurred while running the graphql query: ${error}`);
        return null;
    }
};
