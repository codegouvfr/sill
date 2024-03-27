import * as fs from "fs";
import * as path from "path";

function getProjectRootRec(dirPath: string): string {
    if (fs.existsSync(path.join(dirPath, "package.json"))) {
        return dirPath;
    }
    return getProjectRootRec(path.join(dirPath, ".."));
}

let monorepoRoot: string | undefined = undefined;
export function getMonorepoRootPackageJson(): string {
    if (monorepoRoot !== undefined) {
        return monorepoRoot;
    }
    monorepoRoot = getProjectRootRec(path.join(__dirname, "../../.."));
    return monorepoRoot;
}
