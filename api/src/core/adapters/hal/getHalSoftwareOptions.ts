import fetch from "node-fetch";
import type {
    GetSoftwareExternalDataOptions,
    SoftwareExternalDataOption
} from "../../ports/GetSoftwareExternalDataOptions";
import { halSoftwareFieldsToReturnAsString } from "./HalAPI/getHalSoftware";
import { HalRawSoftware } from "./HalAPI/type";
import { Language } from "../../ports/GetSoftwareExternalData";

export const rawHalSoftwareToExternalOption =
    (language: Language) =>
    (halSoftware: HalRawSoftware): SoftwareExternalDataOption => {
        const enLabel = halSoftware?.en_title_s?.[0] ?? halSoftware?.title_s?.[0] ?? "-";
        const labelByLang = {
            "en": enLabel,
            "fr": halSoftware?.fr_title_s?.[0] ?? enLabel
        };

        const enDescription = halSoftware?.en_abstract_s?.[0] ?? halSoftware.abstract_s?.[0] ?? "-";
        const descriptionByLang = {
            "en": enDescription,
            "fr": halSoftware?.fr_abstract_s?.[0] ?? enDescription
        };

        return {
            externalId: halSoftware.docid,
            label: labelByLang[language],
            description: descriptionByLang[language],
            isLibreSoftware: halSoftware.openAccess_bool,
            externalDataOrigin: "HAL"
        };
    };

// HAL documentation is here : https://api.archives-ouvertes.fr/docs/search

export const getHalSoftwareOptions: GetSoftwareExternalDataOptions = async ({ queryString, language }) => {
    const rawHalSoftwares: HalRawSoftware[] = await fetch(
        [
            `https://api.archives-ouvertes.fr/search/?fq=docType_s:SOFTWARE&wt=json&fl=${halSoftwareFieldsToReturnAsString}&sort=docid%20asc`,
            `q=${encodeURIComponent(queryString)}`
        ].join("&")
    )
        .then(response => response.json())
        .then(results => results.response.docs);

    return rawHalSoftwares.map(rawHalSoftwareToExternalOption(language));
};
