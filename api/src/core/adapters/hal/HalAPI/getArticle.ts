// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import { HAL } from "./types/HAL";

const halArticleFieldsToReturn: (keyof HAL.API.Article)[] = ["en_title_s", "fr_title_s", "docid", "title_s"];

export async function getArticleById(articleHalId: string): Promise<HAL.API.Article> {
    // Get domain using code
    const url = `https://api.archives-ouvertes.fr/search/?q=halId_id:${articleHalId}&fl=${halArticleFieldsToReturn.join(",")}`;

    const res = await fetch(url).catch(err => {
        console.error(err);
        throw new HAL.API.FetchError(undefined);
    });

    if (res.status === 429) {
        await new Promise(resolve => setTimeout(resolve, 100));
        return getArticleById(articleHalId);
    }

    if (res.status === 404) {
        throw new HAL.API.FetchError(res.status);
    }

    const json = await res.json();

    return json.response.docs[0];
}
