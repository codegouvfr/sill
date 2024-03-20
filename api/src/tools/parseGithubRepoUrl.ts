export function parseGitHubRepoUrl(url: string): {
    owner: string;
    repoName: string;
    repository: string;
} {
    const regex = /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)(\.git)?$/;
    const match = url.match(regex);

    if (!match) {
        throw new Error("Invalid GitHub URL");
    }

    const owner = match[1];
    const repoName = match[2].replace(/\.git$/, "");
    const repository = `${owner}/${repoName}`;

    return {
        owner,
        repoName,
        repository
    };
}
