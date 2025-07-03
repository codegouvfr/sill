// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import { GetScholarlyArticle } from "../../../ports/GetScholarlyArticle";
import { crossRef } from "./api";

export const getScholarlyArticle: GetScholarlyArticle = async doi => {
    const workData = await crossRef.work.get(doi).catch(error => {
        if (error.message == "404") return undefined;
        throw error;
    });

    if (!workData || !workData.message) {
        return undefined;
    }

    return {
        "@id": workData.message.DOI,
        "@type": "ScholarlyArticle",
        identifier: {
            "@type": "PropertyValue",
            "propertyID": "doi",
            "url": new URL(`https://doi.org/${doi}`),
            "value": workData.message.DOI
        },
        headline: workData.message.title[0]
    };
};
