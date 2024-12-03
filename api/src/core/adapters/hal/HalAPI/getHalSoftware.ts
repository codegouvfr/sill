import fetch from "node-fetch";
import { HalFetchError, HalRawSoftware } from "./type";

// HAL documentation is here : https://api.archives-ouvertes.fr/docs/search

// Move to get data from API
const halSoftwareFieldsToReturn: (keyof HalRawSoftware)[] = [
    "en_abstract_s",
    "en_title_s",
    "fr_abstract_s",
    "fr_title_s",
    "docid",
    "uri_s",
    "openAccess_bool",
    "label_bibtex",
    "title_s",
    "abstract_s",
    "docType_s",
    "keyword_s",
    "softVersion_s",
    "softPlatform_s",
    "softCodeRepository_s",
    "authFullName_s",
    "authIdHal_s",
    "softProgrammingLanguage_s",
    "softVersion_s",
    "authIdForm_i",
    "domainAllCode_s",
    "modifiedDate_tdate"
];

export const halSoftwareFieldsToReturnAsString = halSoftwareFieldsToReturn.join(",");

export async function fetchHalSoftwareById(halDocid: string): Promise<HalRawSoftware | undefined> {
    const res = await fetch(
        `https://api.archives-ouvertes.fr/search/?q=docid:${halDocid}&wt=json&fl=${halSoftwareFieldsToReturnAsString}&sort=docid%20asc`
    ).catch(() => undefined);

    if (res === undefined) {
        throw new HalFetchError(undefined);
    }

    if (res.status === 429) {
        await new Promise(resolve => setTimeout(resolve, 100));
        return fetchHalSoftwareById(halDocid);
    }

    if (res.status === 404) {
        throw new HalFetchError(res.status);
    }

    const json = await res.json();

    return json.response.docs[0];
}

export async function fetchHalSoftwares(): Promise<Array<HalRawSoftware>> {
    // Filter only software who have an swhidId to filter clean data on https://hal.science, TODO remove and set it as an option to be generic
    const url = `https://api.archives-ouvertes.fr/search/?q=docType_s:SOFTWARE&rows=10000&fl=${halSoftwareFieldsToReturnAsString}&fq=swhidId_s:["" TO *]`;

    const res = await fetch(url).catch(err => {
        console.error(err);
        throw new HalFetchError(undefined);
    });

    if (res.status === 429) {
        await new Promise(resolve => setTimeout(resolve, 100));
        return fetchHalSoftwares();
    }

    if (res.status === 404) {
        throw new HalFetchError(res.status);
    }

    const json = await res.json();

    return json.response.docs;
}
