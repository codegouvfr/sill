// from https://schema.org/Organization
export type SchemaOrganization = {
    "@type": "Organization";
    identifier?: string;
    name: string;
    url: string | undefined;
    parentOrganization?: SchemaOrganization[];
};

// from https://schema.org/Person
export type SchemaPerson = {
    "@id"?: string[];
    "@type": "Person";
    name?: string;
    givenName?: string;
    familyName?: string;
    identifier?: string;
    url?: string;
    affiliation?: SchemaOrganization[];
};

export type SoftwareApplication = {
    "@type": "SoftwareApplication";
    identifier: CodeMetaIdentifier[];
    applicationCategory: string[];
    keywords: string[];
    codeRepository: string[];
    programmingLanguage: string[];
    runtimePlatform: string[];
    license: string[];
    version: string[];
    softwareVersion: string;
    dateModified: string;
    contributor: SchemaPerson[];
    author: HALRole[]; // Non regular Schema.org / CodeMeta
};

export interface HALRole {
    "@type": "role";
    roleName: string; // aut
    author: SchemaPerson; // Non regular Schema.org / CodeMeta
}

export type CodeMetaIdentifier = {
    "@type": string;
    propertyID: string;
    value: string;
};
