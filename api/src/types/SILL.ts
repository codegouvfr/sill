import { ArticleIdentifierOrigin, WebSite } from "../core/adapters/dbApi/kysely/kysely.database";

export namespace SILL {
    export type SourceKind =
        | "GitLab"
        | "HAL"
        | "wikidata"
        | "SWH"
        | "Orcid"
        | "doi"
        | "GitHub"
        | "ComptoirDuLibre"
        | "FramaLibre";

    export const kownWebsite: Record<string, WebSite<any>> = {
        "siren": {
            "@type": "Website",
            name: "SIREN",
            url: new URL("https://www.insee.fr/fr/information/2406147"),
            description: "French business identification number"
        },
        "cnll": {
            "@type": "Website",
            name: "Union des entreprises du logiciel libre et du numérique ouvert",
            url: new URL("https://cnll.fr/")
        }
    };

    export const framaLibreSource = {
        url: new URL("https://framalibre.org"),
        name: "FramaLibre Official instance",
        "@type": "Website" as const,
        additionalType: "FramaLibre" as const
    };

    export const doiSource = {
        "@type": "Website" as const,
        name: "DOI",
        url: new URL("https://doi.org/"),
        additionalType: "doi" as const
    };

    export const halSource = {
        "@type": "Website" as const,
        name: "HAL",
        url: new URL("https://hal.science"),
        additionalType: "HAL" as const
    };

    export const wikidataSource = {
        "@type": "Website" as const,
        name: "Wikidata",
        url: new URL("https://www.wikidata.org"),
        additionalType: "wikidata" as const
    };

    // TODO Remove partiel
    type OfficialSource = "GitHub" | "HAL" | "ComptoirDuLibre" | "wikidata";
    export const knownSources: Record<OfficialSource, WebSite<SourceKind | ArticleIdentifierOrigin>> = {
        "wikidata": {
            "@type": "Website",
            name: "Wikidata",
            url: new URL("https://www.wikidata.org"),
            additionalType: "wikidata"
        },
        "ComptoirDuLibre": {
            "@type": "Website",
            name: "Comptoir du libre",
            url: new URL("https://comptoir-du-libre.org"),
            additionalType: "ComptoirDuLibre"
        },
        "HAL": {
            "@type": "Website",
            name: "HAL",
            url: new URL("https://hal.science"),
            additionalType: "HAL"
        },
        "GitHub": {
            "@type": "Website",
            name: "GitHub",
            url: new URL("https://github.com"),
            additionalType: "GitHub"
        }
    };
}
