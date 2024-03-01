import memoize from "memoizee";
import fetch from "node-fetch";
import { SoftwareExternalData, GetSoftwareExternalData } from "../../ports/GetSoftwareExternalData";
import {
    HalRawSoftware,
    halSoftwareFieldsToReturnAsString,
    rawHalSoftwareToSoftwareExternalData
} from "./halRawSoftware";

// HAL documentation is here : https://api.archives-ouvertes.fr/docs/search

export const getHalSoftware: GetSoftwareExternalData = memoize(
    async (halDocId): Promise<SoftwareExternalData | undefined> => {
        const halRawSoftware = await fetchHalSoftwareById(halDocId).catch(error => {
            if (!(error instanceof HalFetchError)) throw error;
            if (error.status === 404 || error.status === undefined) return;
            throw error;
        });

        if (halRawSoftware === undefined) return;
        if (halRawSoftware.docType_s !== "SOFTWARE") return;

        return rawHalSoftwareToSoftwareExternalData(halRawSoftware);
    },
    {
        "promise": true,
        "maxAge": 3 * 3600 * 1000
    }
);

export class HalFetchError extends Error {
    constructor(public readonly status: number | undefined) {
        super(`Hal fetch error status: ${status}`);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export async function fetchHalSoftwareById(halDocid: string): Promise<HalRawSoftware | undefined> {
    const res = await fetch(
        `https://api.archives-ouvertes.fr/search/?q=docid:${halDocid}&wt=json&fl=${halSoftwareFieldsToReturnAsString}&sort=docid%20asc`
    ).catch(() => undefined);

    console.log("Hal response status : ", res?.status);

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
