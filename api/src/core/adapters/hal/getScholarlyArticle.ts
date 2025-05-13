import { Catalogi } from "../../../types/Catalogi";
import { GetScholarlyArticle } from "../../ports/GetScholarlyArticle";
import { halAPIGateway } from "./HalAPI";

export const getScholarlyArticle: GetScholarlyArticle = async halDocId => {
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
        identifiers: [
            {
                "@type": "PropertyValue",
                name: "DOI id",
                url: new URL(`https://hal.science/${halDocId}`),
                value: halDocId,
                additionalType: "Article",
                subjectOf: Catalogi.halSource
            }
        ],
        headline: articleData.en_title_s?.[0] ?? articleData.fr_title_s?.[0] ?? articleData.title_s[0]
    };
};
