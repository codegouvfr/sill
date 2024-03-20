import { execSync } from "child_process";

const tmpDirBasename = "tmp_x3dL4bZdj4dbq2Td";
const repoUrl = "git@github.com:codegouvfr/sill-data.git";

function executeCommand(command: string) {
    console.log(`Executing: ${command}`);
    execSync(command, { stdio: "inherit" });
}

try {
    // Remove the temporary directory if it exists
    executeCommand(`rm -rf ${tmpDirBasename}`);

    // Clone the entire repo (including all branches and commit history)
    executeCommand(`git clone ${repoUrl} ${tmpDirBasename}`);

    // Change directory
    process.chdir(tmpDirBasename);

    // Fetch all branches from origin
    executeCommand(`git fetch origin`);

    // Change remote URL
    executeCommand(`git remote set-url origin ${repoUrl.replace(".git", "-test.git")}`);

    // Push all branches to the new origin
    executeCommand(`git push -f --all`);

    // Change directory back
    process.chdir("..");

    // Remove the temporary directory
    executeCommand(`rm -rf ${tmpDirBasename}`);

    executeCommand("sleep 30");
} catch (error) {
    console.error("An error occurred:", String(error));
}
