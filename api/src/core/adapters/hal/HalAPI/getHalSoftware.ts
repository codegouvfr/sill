// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import fetch from "node-fetch";
import { HAL } from "./types/HAL";

// HAL documentation is here : https://api.archives-ouvertes.fr/docs/search

// Move to get data from API
const halSoftwareFieldsToReturn: (keyof HAL.API.Software)[] = [
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
    "releasedDate_tdate",
    "softProgrammingLanguage_s",
    "softVersion_s",
    "authIdForm_i",
    "relatedData_s",
    "relatedPublication_s",
    "relatedSoftware_s",
    "domainAllCode_s",
    "label_xml"
];

const halSoftwareFieldsToReturnAsString = halSoftwareFieldsToReturn.join(",");

export async function fetchHalSoftwareById(halDocid: string): Promise<HAL.API.Software | undefined> {
    const res = await fetch(
        `https://api.archives-ouvertes.fr/search/?q=docid:${halDocid}&wt=json&fl=${halSoftwareFieldsToReturnAsString}&sort=docid%20asc`
    ).catch(() => undefined);

    if (res === undefined) {
        throw new HAL.API.FetchError(undefined);
    }

    if (res.status === 429) {
        await new Promise(resolve => setTimeout(resolve, 100));
        return fetchHalSoftwareById(halDocid);
    }

    if (res.status === 404) {
        throw new HAL.API.FetchError(res.status);
    }

    const json = await res.json();

    return json.response.docs[0];
}
type Props = {
    queryString?: string;
    SWHFilter?: boolean;
};

export async function fetchHalSoftwares(params: Props): Promise<Array<HAL.API.Software>> {
    const { queryString, SWHFilter } = params;

    let url = `https://api.archives-ouvertes.fr/search/?fq=docType_s:SOFTWARE&rows=10000&fl=${halSoftwareFieldsToReturnAsString}`;

    if (queryString) {
        url = url + `&q=${encodeURIComponent(queryString)}`;
    }

    // Filter only software who have an swhidId to filter clean data on https://hal.science, TODO remove and set it as an option to be generic
    if (SWHFilter) {
        url = url + `&fq=swhidId_s:["" TO *]`;
    }

    const res = await fetch(url).catch(err => {
        console.error(err);
        throw new HAL.API.FetchError(undefined);
    });

    if (res.status === 429) {
        await new Promise(resolve => setTimeout(resolve, 100));
        return fetchHalSoftwares(params);
    }

    if (res.status === 404) {
        throw new HAL.API.FetchError(res.status);
    }

    const json = await res.json();

    return json.response.docs;
}
