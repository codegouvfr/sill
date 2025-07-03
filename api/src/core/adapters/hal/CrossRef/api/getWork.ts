// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import { CrossRef } from "./type";

export async function getWork(doi: string): Promise<CrossRef.Message<CrossRef.Work> | undefined> {
    const res = await fetch(`https://api.crossref.org/works/${doi}`).catch(err => {
        throw err;
    });

    if (res === undefined) {
        throw new Error(undefined);
    }

    if (res.status === 429) {
        await new Promise(resolve => setTimeout(resolve, 100));
        return getWork(doi);
    }

    if (res.status === 404) {
        return undefined;
    }

    return res.json();
}
