import fetch from "node-fetch";
import { HAL } from "./types/HAL";

export async function getAllDomains(): Promise<HAL.API.Domain[]> {
    // Get all domains
    const url = "http://api.archives-ouvertes.fr/ref/domain/?fl=*";

    const res = await fetch(url).catch(err => {
        console.error(err);
        throw new HAL.API.FetchError(undefined);
    });

    if (res.status === 429) {
        await new Promise(resolve => setTimeout(resolve, 100));
        return getAllDomains();
    }

    if (res.status === 404) {
        throw new HAL.API.FetchError(res.status);
    }

    const json = await res.json();

    return json.response.docs;
}

export async function getDomainByCode(code: string): Promise<HAL.API.Domain> {
    // Get domain using code
    const url = `http://api.archives-ouvertes.fr/ref/domain/?q=code_s:${code}&fl=*`;

    const res = await fetch(url).catch(err => {
        console.error(err);
        throw new HAL.API.FetchError(undefined);
    });

    if (res.status === 429) {
        await new Promise(resolve => setTimeout(resolve, 100));
        return getDomainByCode(code);
    }

    if (res.status === 404) {
        throw new HAL.API.FetchError(res.status);
    }

    const json = await res.json();

    return json.response.docs[0];
}
