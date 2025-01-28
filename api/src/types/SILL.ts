export namespace SILL {
    // from https://schema.org/ScholarlyArticle
    export type ScholarlyArticle = {
        "@id": string;
        "@type": "ScholarlyArticle";
        identifier?: PropertyValue;
    };

    // from https://schema.org/PropertyValue
    export type PropertyValue = {
        "@type"?: "PropertyValue";
        value?: string;
        propertyID?: string;
        url?: URL | null;
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
