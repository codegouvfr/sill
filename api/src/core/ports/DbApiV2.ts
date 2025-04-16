// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import type { Database, DatabaseRow } from "../adapters/dbApi/kysely/kysely.database";
import type {
    Agent,
    Instance,
    InstanceFormData,
    ServiceProvider,
    Software,
    Source
} from "../usecases/readWriteSillData";
import type { OmitFromExisting } from "../utils";
import type { CompiledData } from "./CompileData";
import { ComptoirDuLibre } from "./ComptoirDuLibreApi";

import type { SoftwareExternalData } from "./GetSoftwareExternalData";

export type WithAgentId = { agentId: number };

type GetSoftwareFilters = {
    onlyIfUpdatedMoreThan3HoursAgo?: true;
};

// Other data, intrinsic are managed internally by the database
export type SoftwareExtrinsicRow = Pick<
    DatabaseRow.SoftwareRow,
    | "name"
    | "description"
    | "license"
    | "logoUrl"
    | "versionMin"
    | "dereferencing"
    | "isStillInObservation"
    | "doRespectRgaa"
    | "isFromFrenchPublicService"
    | "isPresentInSupportContract"
    | "softwareType"
    | "workshopUrls"
    | "categories"
    | "generalInfoMd"
    | "keywords"
    | "addedByAgentId"
>;

export type SoftwareExtrinsicCreation = SoftwareExtrinsicRow & Pick<DatabaseRow.SoftwareRow, "referencedSinceTime">;

export interface SoftwareRepository {
    create: (params: { software: SoftwareExtrinsicCreation }) => Promise<number>;
    update: (params: { softwareId: number; software: SoftwareExtrinsicRow }) => Promise<void>;
    updateLastExtraDataFetchAt: (params: { softwareId: number }) => Promise<void>;
    getAll: (filters?: GetSoftwareFilters) => Promise<Software[]>;
    getById: (id: number) => Promise<Software | undefined>;
    getSoftwareIdByExternalIdAndSlug: (params: {
        externalId: string;
        sourceSlug: string;
    }) => Promise<number | undefined>;
    getByIdWithLinkedSoftwaresExternalIds: (id: number) => Promise<
        | {
              software: Software;
              similarSoftwaresExternalIds: string[];
          }
        | undefined
    >;
    getByName: (name: string) => Promise<Software | undefined>;
    countAddedByAgent: (params: { agentId: number }) => Promise<number>;
    getAllSillSoftwareExternalIds: (sourceSlug: string) => Promise<string[]>;
    unreference: (params: { softwareId: number; reason: string; time: number }) => Promise<void>;
}

export interface SoftwareExternalDataRepository {
    insert: (params: { softwareId?: number; sourceSlug: string; externalId: string }) => Promise<void>;
    update: (params: {
        sourceSlug: string;
        externalId: string;
        softwareId?: number;
        softwareExternalData: SoftwareExternalData;
    }) => Promise<void>;
    save: (params: { softwareExternalData: SoftwareExternalData; softwareId: number | undefined }) => Promise<void>; // TODO
    get: (params: {
        sourceSlug: string;
        externalId: string;
    }) => Promise<DatabaseRow.SoftwareExternalDataRow | undefined>;
    getBySoftwareIdAndSource: (params: {
        sourceSlug: string;
        softwareId: number;
    }) => Promise<DatabaseRow.SoftwareExternalDataRow | undefined>;
    getBySoftwareId: (params: { softwareId: number }) => Promise<DatabaseRow.SoftwareExternalDataRow[] | undefined>;
    getBySource: (params: { sourceSlug: string }) => Promise<DatabaseRow.SoftwareExternalDataRow[] | undefined>;
    getIdsBySource: (params: { sourceSlug: string }) => Promise<string[] | undefined>;
}

type CnllPrestataire = {
    name: string;
    siren: string;
    url: string;
};

export type OtherSoftwareExtraData = {
    softwareId: number;
    serviceProviders: ServiceProvider[];
    comptoirDuLibreSoftware: ComptoirDuLibre.Software | null;
    annuaireCnllServiceProviders: CnllPrestataire[] | null;
    latestVersion: { semVer: string; publicationTime: number } | null;
};

export interface OtherSoftwareExtraDataRepository {
    save: (otherSoftwareExtraData: OtherSoftwareExtraData) => Promise<void>;
    getBySoftwareId: (softwareId: number) => Promise<OtherSoftwareExtraData | undefined>;
}

export interface InstanceRepository {
    create: (
        params: {
            formData: InstanceFormData;
        } & WithAgentId
    ) => Promise<number>;
    update: (params: { formData: InstanceFormData; instanceId: number }) => Promise<void>;
    countAddedByAgent: (params: { agentId: number }) => Promise<number>;
    getAll: () => Promise<Instance[]>;
}

export type DbAgent = {
    id: number;
    email: string;
    organization: string | null;
    about: string | undefined;
    isPublic: boolean;
};

export type AgentWithId = Agent & Pick<DbAgent, "id">;

export interface AgentRepository {
    add: (agent: OmitFromExisting<DbAgent, "id">) => Promise<number>;
    update: (agent: DbAgent & Partial<Agent>) => Promise<void>;
    remove: (agentId: number) => Promise<void>;
    getByEmail: (email: string) => Promise<AgentWithId | undefined>;
    getAll: () => Promise<AgentWithId[]>;
    countAll: () => Promise<number>;
    getAllOrganizations: () => Promise<string[]>;
}

export interface SoftwareReferentRepository {
    add: (params: Database["software_referents"]) => Promise<void>;
    remove: (params: { softwareId: number; agentId: number }) => Promise<void>;
    countSoftwaresForAgent: (params: { agentId: number }) => Promise<number>;
    getTotalCount: () => Promise<number>;
}

export interface SoftwareUserRepository {
    add: (params: Database["software_users"]) => Promise<void>;
    remove: (params: { softwareId: number; agentId: number }) => Promise<void>;
    countSoftwaresForAgent: (params: { agentId: number }) => Promise<number>;
}

export interface SourceRepository {
    getMainSource: () => Promise<Source>;
    getWikidataSource: () => Promise<Source | undefined>;
}

export interface SimilarSoftwareRepository {
    insert: (params: {
        softwareId: number;
        externalIds: { sourceSlug: string; externalId: string }[];
    }) => Promise<void>;
    getById: (params: { softwareId: number }) => Promise<{ sourceSlug: string; externalId: string }[]>;
}

export type DbApiV2 = {
    source: SourceRepository;
    software: SoftwareRepository;
    similarSoftware: SimilarSoftwareRepository;
    softwareExternalData: SoftwareExternalDataRepository;
    otherSoftwareExtraData: OtherSoftwareExtraDataRepository;
    instance: InstanceRepository;
    agent: AgentRepository;
    softwareReferent: SoftwareReferentRepository;
    softwareUser: SoftwareUserRepository;
    getCompiledDataPrivate: () => Promise<CompiledData<"private">>;
};
