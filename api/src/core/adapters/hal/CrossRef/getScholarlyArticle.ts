// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import { Catalogi } from "../../../../types/Catalogi";
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
        identifiers: [
            {
                "@type": "PropertyValue",
                name: "DOI id",
                url: new URL(`https://doi.org/${doi}`),
                value: workData.message.DOI,
                additionalType: "Article",
                subjectOf: Catalogi.doiSource
            }
        ],
        headline: workData.message.title[0]
    };
};
