export namespace SILL {
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
