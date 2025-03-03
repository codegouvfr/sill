import type {
    GetSoftwareExternalDataOptions,
    SoftwareExternalDataOption
} from "../../ports/GetSoftwareExternalDataOptions";
import { Language } from "../../ports/GetSoftwareExternalData";
import { HAL } from "./HalAPI/types/HAL";
import { halAPIGateway } from "./HalAPI";

export const rawHalSoftwareToExternalOption =
    (language: Language) =>
    (halSoftware: HAL.API.Software): SoftwareExternalDataOption => {
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
    const rawHalSoftwares = await halAPIGateway.software.getAll({ queryString });

    return rawHalSoftwares.map(rawHalSoftwareToExternalOption(language));
};
