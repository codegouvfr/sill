export type CodeMeta = {
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
    contributor: Auth[];
};

export interface Role extends CodeMeta {
    author: Auth[];
}

export type Auth = {
    "@type": string;
    roleName: string;
    author: Person;
};

export interface Person extends Auth {
    "@type": "Person";
    "@id": string[];
    givenName: string;
    familyName: string;
    affiliation: Organization[];
}

export interface Organization extends Auth {
    "@type": "Organization";
}

export type CodeMetaIdentifier = {
    "@type": string;
    propertyID: string;
    value: string;
};

export interface SoftwareSourceCode extends CodeMeta {
    "@type": "SoftwareSourceCode";
    author: Auth[];
}

export interface SoftwareApplication extends CodeMeta {
    "@type": "SoftwareApplication";
    author: Auth[];
}
