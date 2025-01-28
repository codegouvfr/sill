export namespace SILL {
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
