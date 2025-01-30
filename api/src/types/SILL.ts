export namespace SILL {
    export type Sources = "GitLab" | "HAL" | "WikiData" | "SWH" | "Orcid" | "doi" | "GitHub";

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
        identifier?: PropertyValue;
    };

    // from https://schema.org/PropertyValue
    export type PropertyValue = {
        "@type": "PropertyValue";
        value?: string;
        propertyID?: string;
        url?: URL | null;
        subjectOf?: WebSite;
    };

    // from https://schema.org/Organization
    export type Organization = {
        "@type": "Organization";
        identifier?: string;
        name: string;
        url: string | undefined;
        parentOrganization?: Organization[];
    };

    // from https://schema.org/Organization
    export type Person = {
        "@id"?: string[];
        "@type": "Person";
        name?: string;
        identifier?: string;
        url?: string;
        affiliation?: Organization[];
    };
}
