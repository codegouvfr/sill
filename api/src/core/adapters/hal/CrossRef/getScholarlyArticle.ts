import { SILL } from "../../../../types/SILL";
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
                subjectOf: SILL.doiSource
            }
        ],
        headline: workData.message.title[0]
    };
};
