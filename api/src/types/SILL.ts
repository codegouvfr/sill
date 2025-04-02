export namespace SILL {
    export type Sources =
        | "GitLab"
        | "HAL"
        | "WikiData"
        | "SWH"
        | "Orcid"
        | "doi"
        | "GitHub"
        | "ComptoirDuLibre"
        | "FramaLibre";

    // from https://schema.org/PropertyValue
    export type Identification = {
        "@type": "PropertyValue";
        value: string;
        url: URL;
        subjectOf?: WebSite;
    };

    // from https://schema.org/WebSite
    export type WebSite = {
        "@type": "Website";
        name: string;
        url: URL;
        additionalType?: Sources;
    };

    // from https://schema.org/ScholarlyArticle
    export type ScholarlyArticle = {
        "@id": string;
        "@type": "ScholarlyArticle";
        identifier: ArticleIdentifier;
        headline?: string;
    };

    export type ArticleIdentifierOrigin = "doi" | "arxiv" | "HAL";

    // from https://schema.org/PropertyValue
    export type ArticleIdentifier = {
        "@type": "PropertyValue";
        value: string;
        propertyID: ArticleIdentifierOrigin;
        url: URL | null;
    };

    // from https://schema.org/Organization
    export type Organization = {
        "@type": "Organization";
        identifier?: string;
        name: string;
        url?: string;
        parentOrganizations?: Organization[];
    };

    // from https://schema.org/Person
    export type Person = {
        "@type": "Person";
        name: string;
        identifier?: string;
        url?: string;
        affiliations?: Organization[];
    };
}
