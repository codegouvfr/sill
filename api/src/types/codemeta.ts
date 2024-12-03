export type CodeMeta = {
    identifier: CodeMetaIdentifier[];
    applicationCategory: string[]; // TODO
    keywords: string[];
    codeRepository: string[];
    programmingLanguage: string[];
    runtimePlatform: string[];
    license: string[];
    version: string[];
    softwareVersion: string;
    dateModified: string; // DATE YYYY-MM-DD
    contributor: Auth[];
};

export interface Role extends CodeMeta {
    author: Auth[];
}

export type Auth = {
    "@type": string; // Enum ?
    roleName: string; // Enum ?
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
    name: string;
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
