// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import { ArticleIdentifier, SchemaIdentifier, WebSite } from "../core/adapters/dbApi/kysely/kysely.database";

const cNNLSource: WebSite = {
    "@type": "Website" as const,
    name: "Union des entreprises du logiciel libre et du numérique ouvert",
    url: new URL("https://cnll.fr"),
    additionalType: "cnll"
};

const framaLibreSource: WebSite = {
    url: new URL("https://framalibre.org"),
    name: "FramaLibre Official instance",
    "@type": "Website" as const,
    additionalType: "FramaLibre"
};

const doiSource: WebSite = {
    "@type": "Website" as const,
    name: "DOI instance",
    url: new URL("https://doi.org"),
    additionalType: "doi"
};

const halSource: WebSite = {
    "@type": "Website" as const,
    name: "HAL main instance",
    url: new URL("https://hal.science"),
    additionalType: "HAL"
};

const wikidataSource: WebSite = {
    "@type": "Website" as const,
    name: "Wikidata",
    url: new URL("https://www.wikidata.org"),
    additionalType: "wikidata"
};

const cDLSource: WebSite = {
    "@type": "Website" as const,
    name: "Comptoir du libre",
    url: new URL("https://comptoir-du-libre.org"),
    additionalType: "ComptoirDuLibre"
};

const sWHSource: WebSite = {
    "@type": "Website" as const,
    name: "Software Heritage instance",
    url: new URL("https://www.softwareheritage.org/"),
    additionalType: "SWH"
};

const orcidSource: WebSite = {
    "@type": "Website" as const,
    name: "Open Researcher and Contributor ID",
    url: new URL("https://orcid.org/"),
    additionalType: "ORCID"
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
    makeCNLLIdentifier: (params: { cNNLId: string; url: string; additionalType?: string }): SchemaIdentifier => {
        const { cNNLId, url, additionalType } = params;
        return {
            "@type": "PropertyValue" as const,
            value: cNNLId,
            url: url,
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
    }
};
