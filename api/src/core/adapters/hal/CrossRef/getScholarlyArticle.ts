import { SILL } from "../../../../types/SILL";
import { crossRef } from "./api";

export const getScholarlyArticle = async (doi: string): Promise<SILL.ScholarlyArticle | undefined> => {
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
