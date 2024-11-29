import fetch from "node-fetch";
import { HalAPIDomain, HalFetchError } from "./type";

export async function getAllCategries(): Promise<HalAPIDomain[]> {
    // Filter only software who have an swhidId to filter clean data on https://hal.science, TODO remove and set it as an option to be generic
    const url = "http://api.archives-ouvertes.fr/ref/domain/?fl=*";

    const res = await fetch(url).catch(err => {
        console.error(err);
        throw new HalFetchError(undefined);
    });

    if (res.status === 429) {
        await new Promise(resolve => setTimeout(resolve, 100));
        return getAllCategries();
    }

    if (res.status === 404) {
        throw new HalFetchError(res.status);
    }

    const json = await res.json();

    return json.response.docs;
}

export async function getCategoryByCode(code: string): Promise<HalAPIDomain> {
    // Filter only software who have an swhidId to filter clean data on https://hal.science, TODO remove and set it as an option to be generic
    const url = `http://api.archives-ouvertes.fr/ref/domain/?q=code_s:${code}&fl=*`;

    const res = await fetch(url).catch(err => {
        console.error(err);
        throw new HalFetchError(undefined);
    });

    if (res.status === 429) {
        await new Promise(resolve => setTimeout(resolve, 100));
        return getCategoryByCode(code);
    }

    if (res.status === 404) {
        throw new HalFetchError(res.status);
    }

    const json = await res.json();

    return json.response.docs[0];
}
