import { SILL } from "../../../types/SILL";
import { halAPIGateway } from "./HalAPI";

export const getScholarlyArticle = async (halDocId: string): Promise<SILL.ScholarlyArticle | undefined> => {
    const articleData = await halAPIGateway.article.getById(halDocId).catch(error => {
        if (error.message == "404") return undefined;
        throw error;
    });

    if (!articleData) {
        return undefined;
    }

    return {
        "@id": halDocId,
        "@type": "ScholarlyArticle",
        identifier: {
            "@type": "PropertyValue",
            "propertyID": "HAL",
            "url": new URL(`https://hal.science/${halDocId}`),
            "value": halDocId
        },
        headline: articleData.en_title_s?.[0] ?? articleData.fr_title_s?.[0] ?? articleData.title_s[0]
    };
};
