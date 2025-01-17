import { Generated, JSONColumnType } from "kysely";

// from https://schema.org/Organization
type SchemaOrganization = {
    name: string;
    url: string | undefined;
    parentOrganizations?: SchemaOrganization[];
};

export type Database = {
    agents: AgentsTable;
    software_referents: SoftwareReferentsTable;
    software_users: SoftwareUsersTable;
    instances: InstancesTable;
    softwares: SoftwaresTable;
    software_external_datas: SoftwareExternalDatasTable;
    softwares__similar_software_external_datas: SimilarExternalSoftwareExternalDataTable;
    compiled_softwares: CompiledSoftwaresTable;
};

type AgentsTable = {
    id: Generated<number>;
    email: string;
    organization: string | null;
    about: string | null;
    isPublic: boolean;
};

type Os = "windows" | "linux" | "mac" | "android" | "ios";

type SoftwareUsersTable = {
    softwareId: number;
    agentId: number;
    useCaseDescription: string;
    os: Os | null;
    version: string;
    serviceUrl: string | null;
};

type SoftwareReferentsTable = {
    softwareId: number;
    agentId: number;
    isExpert: boolean;
    useCaseDescription: string;
    serviceUrl: string | null;
};

type InstancesTable = {
    id: Generated<number>;
    mainSoftwareSillId: number;
    organization: string;
    targetAudience: string;
    instanceUrl: string | null;
    isPublic: boolean;
    addedByAgentId: number;
    referencedSinceTime: number;
    updateTime: number;
};

type ExternalId = string;
type ExternalDataOrigin = "wikidata" | "HAL";
type LocalizedString = Partial<Record<string, string>>;

type SimilarExternalSoftwareExternalDataTable = {
    softwareId: number;
    similarExternalId: ExternalId;
};

type SoftwareExternalDatasTable = {
    externalId: ExternalId;
    externalDataOrigin: ExternalDataOrigin;
    developers: JSONColumnType<
        {
            name: string;
            id?: string;
            url: string;
            affiliations?: SchemaOrganization[];
        }[]
    >;
    label: string | JSONColumnType<LocalizedString>;
    description: string | JSONColumnType<LocalizedString>;
    isLibreSoftware: boolean;
    logoUrl: string | null;
    framaLibreId: string | null;
    websiteUrl: string | null;
    sourceUrl: string | null;
    documentationUrl: string | null;
    license: string | null;
    softwareVersion: string | null;
    keywords: JSONColumnType<string[]> | null;
    programmingLanguages: JSONColumnType<string[]> | null;
    applicationCategories: JSONColumnType<string[]> | null;
    publicationTime: Date | null;
};

type SoftwareType =
    | { type: "cloud" }
    | { type: "stack" }
    | {
          type: "desktop/mobile";
          os: Record<Os, boolean>;
      };

type SoftwaresTable = {
    id: Generated<number>;
    name: string;
    description: string;
    referencedSinceTime: number;
    updateTime: number;
    lastExtraDataFetchAt: Date | null;
    dereferencing: JSONColumnType<{
        reason?: string;
        time: number;
        lastRecommendedVersion?: string;
    }> | null;
    isStillInObservation: boolean;
    doRespectRgaa: boolean | null;
    isFromFrenchPublicService: boolean;
    isPresentInSupportContract: boolean;
    parentSoftwareWikidataId: string | null;
    externalId: string | null;
    externalDataOrigin: "wikidata" | "HAL" | null;
    comptoirDuLibreId: number | null;
    license: string;
    softwareType: JSONColumnType<SoftwareType>;
    catalogNumeriqueGouvFrId: string | null;
    versionMin: string | null;
    workshopUrls: JSONColumnType<string[]>;
    testUrls: JSONColumnType<
        {
            description: string;
            url: string;
        }[]
    >;
    categories: JSONColumnType<string[]>;
    generalInfoMd: string | null;
    addedByAgentId: number;
    logoUrl: string | null;
    keywords: JSONColumnType<string[]>;
};

// ---------- compiled data ----------

export namespace PgComptoirDuLibre {
    type Provider = {
        id: number;
        url: string;
        name: string;
        type: string;
        external_resources: {
            website: string | null;
        };
    };

    type User = {
        id: number;
        url: string;
        name: string;
        type: string;
        external_resources: {
            website: string | null;
        };
    };

    export type Software = {
        id: number;
        logoUrl: string | undefined;
        keywords: string[] | undefined;
        created: string;
        modified: string;
        url: string;
        name: string;
        licence: string;
        external_resources: {
            website: string | null;
            repository: string | null;
        };
        providers: Provider[];
        users: User[];
    };
}

type ServiceProvider = {
    name: string;
    website?: string;
    cdlUrl?: string;
    cnllUrl?: string;
    siren?: string;
};

type CompiledSoftwaresTable = {
    softwareId: number;
    serviceProviders: JSONColumnType<ServiceProvider[]>;
    comptoirDuLibreSoftware: JSONColumnType<PgComptoirDuLibre.Software> | null;
    annuaireCnllServiceProviders: JSONColumnType<
        {
            name: string;
            siren: string;
            url: string;
        }[]
    > | null;
    latestVersion: JSONColumnType<{
        semVer: string;
        publicationTime: number;
    }> | null;
};
