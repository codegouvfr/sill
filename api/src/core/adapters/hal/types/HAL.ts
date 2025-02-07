import { SILL } from "../../../../types/SILL";

export namespace HAL {
    // HAL implementation of https://schema.org/Person
    export type Person = {
        "@id"?: string[];
        "@type": "Person";
        givenName?: string;
        familyName?: string;
        affiliation?: SILL.Organization[];
    };

    export type ArticleIdentifierOrigin = "doi" | "arxiv" | "hal";

    // HAL implementation of https://codemeta.github.io/terms/
    export type SoftwareApplication = {
        "@context"?: string[];
        "@type": "SoftwareSourceCode";
        name: string;
        description?: string;
        dateCreated?: string;
        datePublished?: string;
        license?: string[] | string;
        url?: string;
        identifier?: Identifier[];
        applicationCategory?: string[];
        funder?: string[];
        keywords?: string[];
        codeRepository?: string[];
        programmingLanguage?: string[];
        operatingSystem?: string[];
        runtimePlatform?: string[];
        version?: string[] | string;
        softwareVersion?: string;
        dateModified?: string;
        developmentStatus?: string;
        author: Role[]; // Non regular Schema.org / CodeMeta
        contributor?: Person[];
        referencePublication?: string[] | string | Object;
    };

    // HAL implementation of https://codemeta.github.io/terms/
    export interface Role {
        "@type": "role";
        roleName: string; // aut
        author: Person; // Non regular Schema.org / CodeMeta
    }

    // HAL implementation of https://schema.org/identifier
    export type Identifier = {
        "@type": string;
        propertyID: string;
        value: string;
    };
}
