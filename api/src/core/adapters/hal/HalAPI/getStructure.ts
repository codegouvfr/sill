import { HalFetchError, HalStructure } from "./type";

export const getHalStructureByAcronym = async (structureAcronym: string): Promise<HalStructure | undefined> => {
    const url = `http://api.archives-ouvertes.fr/ref/structure/?fl=*&q=acronym_s:"${encodeURIComponent(
        structureAcronym
    )}"`;

    const res = await fetch(url, {
        signal: AbortSignal.timeout(10000)
    }).catch(err => {
        console.error(err);
        throw new HalFetchError(undefined);
    });

    if (res.status === 429) {
        await new Promise(resolve => setTimeout(resolve, 100));
        return getHalStructureByAcronym(structureAcronym);
    }

    if (res.status === 404) {
        throw new HalFetchError(res.status);
    }

    const json = await res.json();

    if (json.error) {
        throw new HalFetchError(json.error);
    }

    // What do to when multiple for one acronym while in code meta only reference to acronym => LIDILEM, EPFL
    return json.response.docs?.[0]; // json.response.numFound === 1 ? : undefined;
};

export const getHalStructureById = async (docid: number): Promise<HalStructure | undefined> => {
    const url = `http://api.archives-ouvertes.fr/ref/structure/?fl=*&q=docid:${docid}`;

    const res = await fetch(url, {
        signal: AbortSignal.timeout(10000)
    }).catch(err => {
        console.error(err);
        throw new HalFetchError(undefined);
    });

    if (res.status === 429) {
        await new Promise(resolve => setTimeout(resolve, 100));
        return getHalStructureById(docid);
    }

    if (res.status === 404) {
        throw new HalFetchError(res.status);
    }

    const json = await res.json();

    if (json.error) {
        throw new HalFetchError(json.error);
    }

    return json.response.numFound === 1 ? json.response.docs?.[0] : undefined;
};