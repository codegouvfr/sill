import fetch from "node-fetch";
import type { GetSoftwareExternalDataOptions } from "../../ports/GetSoftwareExternalDataOptions";
import { HalRawSoftware, halSoftwareFieldsToReturnAsString, rawHalSoftwareToExternalOption } from "./halRawSoftware";

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
