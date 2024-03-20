import { exec } from "./exec";
import { join as pathJoin } from "path";
import * as fs from "fs";
import crypto from "crypto";
import { Mutex } from "async-mutex";

const mutexes: Record<string, Mutex> = {};

const globalMutex = new Mutex();

let isFirstCall = true;

export const gitSsh = async (params: {
    sshUrl: string;
    sshPrivateKeyName: string;
    sshPrivateKey: string;
    shaish?: string;
    commitAuthorEmail?: string;
    doForceReClone?: boolean;
    action: (params: {
        repoPath: string;
    }) => Promise<{ doCommit: false } | { doCommit: true; doAddAll: boolean; message: string }>;
}) => {
    const {
        sshUrl,
        sshPrivateKeyName,
        sshPrivateKey,
        shaish,
        doForceReClone = false,
        commitAuthorEmail = "actions@github.com",
        action
    } = params;

    const cacheDir = pathJoin(process.cwd(), "node_modules", ".cache", "gitSSH");

    await globalMutex.runExclusive(async () => {
        if (!isFirstCall) {
            return;
        }

        isFirstCall = false;

        await fs.promises.rm(cacheDir, { "recursive": true, "force": true });

        await fs.promises.mkdir(cacheDir, { "recursive": true });
    });

    const mutex = (mutexes[sshUrl + (shaish || "")] ??= new Mutex());

    return mutex.runExclusive(async function callee() {
        await configureOpenSshClient({ sshPrivateKeyName, sshPrivateKey });

        const repoHash = crypto
            .createHash("sha1")
            .update(sshUrl + (shaish || ""))
            .digest("hex");
        const repoPath = pathJoin(cacheDir, repoHash);

        const repoExists = await fs.promises
            .stat(repoPath)
            .then(() => true)
            .catch(() => false);

        if (doForceReClone && repoExists) {
            await fs.promises.rm(repoPath, { "recursive": true, "force": true });

            await callee();

            return;
        }

        if (!repoExists) {
            console.log(`Performing git clone ${sshUrl} ${repoPath}`);

            if (shaish === undefined) {
                await exec(`git clone --depth 1 ${sshUrl} ${repoPath}`);
            } else {
                if (isSha(shaish)) {
                    await exec(`git clone ${sshUrl} ${repoPath}`);
                    await exec(`git checkout ${shaish}`, { "cwd": repoPath });
                } else {
                    await exec(`git clone --branch ${shaish} --depth 1 ${sshUrl} ${repoPath}`);
                }
            }
        } else {
            console.log(`Performing git pull ${sshUrl} ${repoPath}`);

            try {
                await exec(`git pull`, { "cwd": repoPath });

                // NOTE: If on main or on a branch
                if (shaish === undefined || !isSha(shaish)) {
                    // NOTE: Exit gratuitously if there are no changes
                    await exec(
                        [
                            `current_branch=$(git rev-parse --abbrev-ref HEAD)`,
                            `[ -z "$(git status --porcelain)" ]`,
                            `[ -z "$(git status --porcelain)" ]`,
                            `[ "$(git rev-list HEAD...origin/$current_branch --count)" -eq 0 ]`
                        ].join(" && "),
                        { "cwd": repoPath }
                    );
                }
            } catch {
                console.log(`There's been a force push, so we're going to re-clone the repo ${sshUrl} ${repoPath}`);

                await fs.promises.rm(repoPath, { "recursive": true, "force": true });

                await callee();

                return;
            }
        }

        const changesResult = await action({ repoPath });

        if (changesResult.doCommit) {
            await exec(`git config --local user.email "${commitAuthorEmail}"`, {
                "cwd": repoPath
            });
            await exec(`git config --local user.name "${commitAuthorEmail.split("@")[0]}"`, { "cwd": repoPath });

            if (changesResult.doAddAll) {
                await exec(`git add -A`, { "cwd": repoPath });
            }

            //NOTE: This can fail if there are no changes to commit
            try {
                await exec(`git commit -am "${changesResult.message}"`, { "cwd": repoPath });

                await exec(`git push`, { "cwd": repoPath });
            } catch {}
        }
    });
};

export class ErrorNoBranch extends Error {
    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

async function configureOpenSshClient(params: { sshPrivateKeyName: string; sshPrivateKey: string }) {
    const { sshPrivateKey, sshPrivateKeyName } = params;

    const sshConfigDirPath = (await exec(`cd ~ && mkdir -p .ssh && cd .ssh && pwd`)).replace(/\r?\n$/, "");

    await fs.promises.writeFile(
        pathJoin(sshConfigDirPath, sshPrivateKeyName),
        Buffer.from(sshPrivateKey.replace(/\\n/g, "\n"), "utf8"),
        { "mode": 0o600 }
    );

    const sshConfigFilePath = pathJoin(sshConfigDirPath, "config");

    const doesSshConfigFileExists = !!(await fs.promises.stat(sshConfigFilePath).catch(() => null));

    if (doesSshConfigFileExists) {
        return;
    }

    await fs.promises.writeFile(sshConfigFilePath, Buffer.from("StrictHostKeyChecking=no\n", "utf8"));
}

function isSha(shaish: string): boolean {
    return /^[0-9a-f]{7,40}$/i.test(shaish);
}
