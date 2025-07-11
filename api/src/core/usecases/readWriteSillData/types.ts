// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import type { LocalizedString, SimilarSoftwareExternalData } from "../../ports/GetSoftwareExternalData";
import { DatabaseDataType } from "../../ports/DbApiV2";
import {
    SchemaIdentifier,
    SchemaOrganization,
    SchemaPerson,
    ScholarlyArticle
} from "../../adapters/dbApi/kysely/kysely.database";

export type Software = {
    logoUrl: string | undefined;
    softwareId: number;
    softwareName: string;
    softwareDescription: string;
    serviceProviders: SchemaOrganization[];
    latestVersion:
        | {
              semVer?: string;
              publicationTime?: number;
          }
        | undefined;
    addedTime: number;
    updateTime: number;
    dereferencing?:
        | {
              reason?: string;
              time: number;
              lastRecommendedVersion?: string;
          }
        | undefined;
    applicationCategories: string[];
    prerogatives: Prerogatives;
    userAndReferentCountByOrganization: Record<string, { userCount: number; referentCount: number }>;
    authors: Array<SchemaPerson | SchemaOrganization>;
    officialWebsiteUrl: string | undefined;
    codeRepositoryUrl: string | undefined;
    documentationUrl: string | undefined;
    versionMin: string | undefined;
    license: string;
    externalId: string | undefined;
    sourceSlug: string | undefined;
    softwareType: SoftwareType;
    similarSoftwares: Software.SimilarSoftware[];
    keywords: string[];
    programmingLanguages: string[];
    referencePublications?: ScholarlyArticle[];
    identifiers?: SchemaIdentifier[];
};

export type Source = DatabaseDataType.SourceRow;

export namespace Software {
    export type SimilarSoftware =
        | SimilarSoftware.SimilarSoftwareNotRegistered
        | SimilarSoftware.SimilarRegisteredSoftware;

    export namespace SimilarSoftware {
        export type SimilarSoftwareNotRegistered = {
            registered: false;
            sourceSlug: string;
            externalId: string;
            isLibreSoftware: boolean | undefined;
            label: LocalizedString;
            description: LocalizedString;
        };

        export type SimilarRegisteredSoftware = {
            registered: true;
            softwareId: number;
            softwareName: string;
            softwareDescription: string;
        } & SimilarSoftwareExternalData;
    }
}

export type Agent = {
    //NOTE: Undefined if the agent isn't referent of at least one software
    // If it's the user the email is never undefined.
    email: string;
    organization: string | null;
    declarations: (DeclarationFormData & { softwareName: string })[];
    isPublic: boolean;
    about: string | undefined;
};

export type Instance = {
    id: number;
    mainSoftwareSillId: number;
    organization: string;
    targetAudience: string;
    instanceUrl: string | undefined;
    isPublic: boolean;
};

export type SoftwareType = SoftwareType.Desktop | SoftwareType.CloudNative | SoftwareType.Stack;

export namespace SoftwareType {
    export type Desktop = {
        type: "desktop/mobile";
        os: Record<Os, boolean>;
    };

    export type CloudNative = {
        type: "cloud";
    };

    export type Stack = {
        type: "stack";
    };
}

type Prerogatives = {
    isPresentInSupportContract: boolean;
    isFromFrenchPublicServices: boolean;
    doRespectRgaa: boolean | null;
};
export type Prerogative = keyof Prerogatives;

export type Os = "windows" | "linux" | "mac" | "android" | "ios";

export type SoftwareFormData = {
    softwareName: string;
    softwareDescription: string;
    softwareType: SoftwareType;
    externalIdForSource: string | undefined;
    sourceSlug: string;
    softwareLicense: string;
    softwareMinimalVersion: string | undefined;
    similarSoftwareExternalDataIds: string[];
    softwareLogoUrl: string | undefined;
    softwareKeywords: string[];

    isPresentInSupportContract: boolean;
    isFromFrenchPublicService: boolean;
    doRespectRgaa: boolean | null;
};

export type DeclarationFormData = DeclarationFormData.User | DeclarationFormData.Referent;

export namespace DeclarationFormData {
    export type User = {
        declarationType: "user";
        usecaseDescription: string;
        /** NOTE: undefined if the software is not of type desktop/mobile */
        os: Os | undefined;
        version: string;
        /** NOTE: Defined only when software is cloud */
        serviceUrl: string | undefined;
    };

    export type Referent = {
        declarationType: "referent";
        isTechnicalExpert: boolean;
        usecaseDescription: string;
        /** NOTE: Can be not undefined only if cloud */
        serviceUrl: string | undefined;
    };
}

export type InstanceFormData = {
    mainSoftwareSillId: number;
    organization: string;
    targetAudience: string;
    instanceUrl: string | undefined;
    isPublic: boolean;
};

/* Obselete data for Compile Data : TODO Remove that */

export type ServiceProvider = {
    name: string;
    website?: string;
    cdlUrl?: string;
    cnllUrl?: string;
    siren?: string;
};
