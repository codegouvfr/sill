// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import * as fs from "fs";
import * as path from "path";

function getProjectRootRec(dirPath: string): string {
    if (fs.existsSync(path.join(dirPath, "package.json"))) {
        return dirPath;
    }

    if (dirPath === "/") throw new Error("Can't find the root of the project");

    return getProjectRootRec(path.join(dirPath, ".."));
}

let monorepoRoot: string | undefined = undefined;
export function getMonorepoRootPackageJson(): string {
    if (monorepoRoot !== undefined) {
        return monorepoRoot;
    }

    monorepoRoot = getProjectRootRec(path.join(__dirname));
    if (monorepoRoot.includes("/api")) {
        console.log("includes /api ", monorepoRoot);
        monorepoRoot = getProjectRootRec(path.join(monorepoRoot, ".."));
        return monorepoRoot;
    }

    return monorepoRoot;
}
