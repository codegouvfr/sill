import { ArticleIdentifier, SchemaIdentifier, WebSite } from "./adapters/dbApi/kysely/kysely.database";

export type OmitFromExisting<T, K extends keyof T> = Omit<T, K>;

export const cNNLSource: WebSite = {
    "@type": "Website" as const,
    name: "Union des entreprises du logiciel libre et du numérique ouvert",
    url: new URL("https://cnll.fr"),
    additionalType: "cnll"
};

export const framaLibreSource: WebSite = {
    url: new URL("https://framalibre.org"),
    name: "FramaLibre Official instance",
    "@type": "Website" as const,
    additionalType: "FramaLibre"
};

export const doiSource: WebSite = {
    "@type": "Website" as const,
    name: "DOI instance",
    url: new URL("https://doi.org"),
    additionalType: "doi"
};

export const halSource: WebSite = {
    "@type": "Website" as const,
    name: "HAL main instance",
    url: new URL("https://hal.science"),
    additionalType: "HAL"
};

export const wikidataSource: WebSite = {
    "@type": "Website" as const,
    name: "Wikidata",
    url: new URL("https://www.wikidata.org"),
    additionalType: "wikidata"
};

export const cDLSource: WebSite = {
    "@type": "Website" as const,
    name: "Comptoir du libre",
    url: new URL("https://comptoir-du-libre.org"),
    additionalType: "ComptoirDuLibre"
};

export const sWHSource: WebSite = {
    "@type": "Website" as const,
    name: "Software Heritage instance",
    url: new URL("https://www.softwareheritage.org/"),
    additionalType: "SWH"
};

export const orcidSource: WebSite = {
    "@type": "Website" as const,
    name: "Open Researcher and Contributor ID",
    url: new URL("https://orcid.org/"),
    additionalType: "ORCID"
};

export const nationalSIREN: WebSite = {
    "@type": "Website" as const,
    name: "L’Annuaire des Entreprises",
    url: new URL("https://annuaire-entreprises.data.gouv.fr"),
    additionalType: "SIREN"
};

export const identifersUtils = {
    makeGenericIdentifier: (params: { value: string; url?: string | URL }): SchemaIdentifier => {
        const { value, url } = params;
        return {
            "@type": "PropertyValue" as const,
            value,
            url
        };
    },
    makeFramaIndentifier: (params: {
        framaLibreId: string;
        additionalType?: string;
        url?: string | URL;
    }): SchemaIdentifier => {
        const { framaLibreId, additionalType, url } = params;
        return {
            "@type": "PropertyValue" as const,
            name: "ID on FramaLibre",
            value: framaLibreId,
            url: url
                ? url
                : framaLibreId.includes("https")
                  ? new URL(framaLibreId)
                  : new URL(`https://framalibre.org/notices/${framaLibreId}`),
            subjectOf: framaLibreSource,
            ...(additionalType ? { additionalType: additionalType } : {})
        };
    },
    makeWikidataIdentifier: (params: {
        wikidataId: string;
        additionalType?: string;
        url?: string | URL;
    }): SchemaIdentifier => {
        const { wikidataId, additionalType, url } = params;
        return {
            value: wikidataId,
            "@type": "PropertyValue" as const,
            url: url ? url : `https://www.wikidata.org/wiki/${wikidataId}`,
            subjectOf: wikidataSource,
            name: "ID on Wikidata",
            ...(additionalType ? { additionalType: additionalType } : {})
        };
    },
    makeCDLIdentifier: (params: { cdlId: string; url: string | URL; additionalType?: string }): SchemaIdentifier => {
        const { cdlId, url, additionalType } = params;
        return {
            "@type": "PropertyValue" as const,
            additionalType: "Organization",
            value: cdlId,
            url: url,
            subjectOf: cDLSource,
            ...(additionalType ? { additionalType: additionalType } : {})
        };
    },
    makeCNLLIdentifier: (params: { cNNLId: string; url?: string; additionalType?: string }): SchemaIdentifier => {
        const { cNNLId, url, additionalType } = params;
        return {
            "@type": "PropertyValue" as const,
            value: cNNLId,
            url: url ?? undefined,
            subjectOf: cNNLSource,
            ...(additionalType ? { additionalType: additionalType } : {})
        };
    },
    makeDOIIdentifier: (params: { doi: string; additionalType?: string }): SchemaIdentifier => {
        const { doi, additionalType } = params;
        return {
            "@type": "PropertyValue",
            name: "DOI id",
            url: new URL(`https://doi.org/${doi}`),
            value: doi,
            subjectOf: doiSource,
            ...(additionalType ? { additionalType: additionalType } : {})
        };
    },
    makeArticleDOIIdentifier: (params: { doi: string }): ArticleIdentifier => {
        return identifersUtils.makeDOIIdentifier({ ...params, additionalType: "Aritcle" }) as ArticleIdentifier;
    },
    makeHALIdentifier: (params: { halId: string; additionalType?: string; url?: string }): SchemaIdentifier => {
        const { halId, additionalType, url } = params;
        return {
            "@type": "PropertyValue" as const,
            value: halId,
            url: url ? url : `https://hal.science/hal-0${halId}`,
            subjectOf: halSource,
            ...(additionalType ? { additionalType: additionalType } : {})
        };
    },
    makeHALArticleIdentifier: (params: { halId: string; url?: string }): ArticleIdentifier => {
        return identifersUtils.makeHALIdentifier({ ...params, additionalType: "Aritcle" }) as ArticleIdentifier;
    },
    makeSWHIdentifier: (params: { swhId: string; additionalType?: string; url: string }): SchemaIdentifier => {
        const { swhId, additionalType, url } = params;
        return {
            "@type": "PropertyValue" as const,
            value: swhId,
            url: url,
            subjectOf: sWHSource,
            ...(additionalType ? { additionalType: additionalType } : {})
        };
    },
    makeOrcidIdentifer: (params: { orcidId: string; additionalType?: string }): SchemaIdentifier => {
        const { orcidId, additionalType } = params;
        return {
            "@type": "PropertyValue" as const,
            value: orcidId,
            url: `https://orcid.org/${orcidId}`,
            subjectOf: orcidSource,
            ...(additionalType ? { additionalType: additionalType } : {})
        };
    },
    makeSIRENIdentifier: (params: { SIREN: string; additionalType?: string; url?: string }) => {
        const { SIREN, additionalType, url } = params;
        return {
            ...{
                "@type": "PropertyValue" as const,
                value: SIREN,
                url: url ?? undefined,
                subjectOf: nationalSIREN
            },
            ...(additionalType ? { additionalType: additionalType } : {})
        };
    }
};

function isEmpty(value: any): boolean {
    return (
        value === null ||
        value === undefined ||
        (Array.isArray(value) && value.length === 0) ||
        (typeof value === "string" && value.trim() === "")
    );
}

const isEqual = (var1: any, var2: any): boolean => {
    // Check if both values are strictly equal
    if (var1 === var2) {
        return true;
    }

    // Check if both values are of the same type
    if (typeof var1 !== typeof var2) {
        return false;
    }

    // Handle null and undefined cases
    if (var1 === null || var2 === null) {
        return var1 === var2;
    }

    // Handle arrays
    if (Array.isArray(var1) && Array.isArray(var2)) {
        if (var1.length !== var2.length) {
            return false;
        }
        for (let i = 0; i < var1.length; i++) {
            if (!isDeepIncludedInArray(var1[i], var2)) {
                return false;
            }
        }
        return true;
    }

    // Handle objects
    if (typeof var1 === "object" && typeof var2 === "object") {
        const keysA = Object.keys(var1);
        const keysB = Object.keys(var2);

        if (keysA.length !== keysB.length) {
            return false;
        }

        for (let key of keysA) {
            if (!keysB.includes(key) || !isEqual(var1[key], var2[key])) {
                console.log(var1[key], " !==", var2[key]);
                return false;
            }
        }

        return true;
    }

    // If none of the above conditions are met, the values are not equal
    return false;
};

const isDeepIncludedInArray = (var1: any, arrayToCheck: any[]): boolean => {
    return arrayToCheck.some(element => isEqual(var1, element));
};

function mergeArrays(arr1: any[], arr2: any[]): any[] {
    const merged = [...arr1, ...arr2];
    return merged.reduce((acc, item) => {
        if (isDeepIncludedInArray(item, acc)) return acc;
        return [item, ...acc];
    }, []);
}

export const mergeObjects = <T extends Object>(obj1: T, obj2: T | T[]): T => {
    if (Array.isArray(obj2)) {
        if (obj2.length === 0) return obj1;

        const [first, ...rest] = obj2;
        return mergeObjects(obj1, mergeObjects(first, rest));
    }

    // Case both objects
    if (Object.keys(obj1).length === 0) return obj2;
    if (Object.keys(obj2).length === 0) return obj2;

    const result: T = obj1;

    for (const key in obj2) {
        if (obj2.hasOwnProperty(key)) {
            const value1 = obj1[key as keyof T];
            const value2 = obj2[key as keyof T];

            if (isEmpty(value1)) {
                result[key as keyof T] = value2;
            } else if (Array.isArray(value1) && Array.isArray(value2)) {
                if (value1.length === 0) {
                    result[key as keyof T] = value2;
                } else {
                    (result[key as keyof T] as any[]) = mergeArrays(value1, value2);
                }
            } else if (typeof value1 === "object" && typeof value2 === "object") {
                (result[key as keyof T] as Object) = mergeObjects(value1 as Object, value2 as Object);
            } else {
                result[key as keyof T] = value2;
            }
        }
    }

    return result;
};
