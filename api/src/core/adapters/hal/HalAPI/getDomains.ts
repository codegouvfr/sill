import fetch from "node-fetch";
import { HalAPIDomain, HalFetchError } from "./type";

export async function getAllDomains(): Promise<HalAPIDomain[]> {
    // Get all domains
    const url = "http://api.archives-ouvertes.fr/ref/domain/?fl=*";

    const res = await fetch(url).catch(err => {
        console.error(err);
        throw new HalFetchError(undefined);
    });

    if (res.status === 429) {
        await new Promise(resolve => setTimeout(resolve, 100));
        return getAllDomains();
    }

    if (res.status === 404) {
        throw new HalFetchError(res.status);
    }

    const json = await res.json();

    return json.response.docs;
}

export async function getDomainByCode(code: string): Promise<HalAPIDomain> {
    // Get domain using code
    const url = `http://api.archives-ouvertes.fr/ref/domain/?q=code_s:${code}&fl=*`;

    const res = await fetch(url).catch(err => {
        console.error(err);
        throw new HalFetchError(undefined);
    });

    if (res.status === 429) {
        await new Promise(resolve => setTimeout(resolve, 100));
        return getDomainByCode(code);
    }

    if (res.status === 404) {
        throw new HalFetchError(res.status);
    }

    const json = await res.json();

    return json.response.docs[0];
}
