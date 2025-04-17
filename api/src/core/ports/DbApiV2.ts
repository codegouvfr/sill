import type { Database, DatabaseRowOutput } from "../adapters/dbApi/kysely/kysely.database";
import { TransformRepoToCleanedRow } from "../adapters/dbApi/kysely/kysely.utils";
import type { Agent, Instance, InstanceFormData, ServiceProvider, Software } from "../usecases/readWriteSillData";
import type { OmitFromExisting } from "../utils";
import type { CompiledData } from "./CompileData";
import { ComptoirDuLibre } from "./ComptoirDuLibreApi";

import type { SoftwareExternalData } from "./GetSoftwareExternalData";

export type WithAgentId = { agentId: number };

// Other data, intrinsic are managed internally by the database
export type SoftwareExtrinsicRow = Pick<
    DatabaseDataType.SoftwareRow,
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
    | "externalIdForSource" // TODO Remove
    | "sourceSlug" // TODO Remove
>;

export namespace DatabaseDataType {
    export type AgentRow = TransformRepoToCleanedRow<DatabaseRowOutput.Agent>;
    export type SoftwareReferentRow = TransformRepoToCleanedRow<DatabaseRowOutput.SoftwareReferent>;
    export type SoftwareUsertRow = TransformRepoToCleanedRow<DatabaseRowOutput.SoftwareUsert>;
    export type InstanceRow = TransformRepoToCleanedRow<DatabaseRowOutput.Instance>;
    export type SoftwareRow = TransformRepoToCleanedRow<DatabaseRowOutput.Software>;
    export type SoftwareExternalDataRow = TransformRepoToCleanedRow<DatabaseRowOutput.SoftwareExternalData>;
    export type SimilarExternalSoftwareExternalDataRow =
        TransformRepoToCleanedRow<DatabaseRowOutput.SimilarExternalSoftwareExternalData>;
    export type CompiledSoftwaresRow = TransformRepoToCleanedRow<DatabaseRowOutput.CompiledSoftwares>;
    export type SourceRow = TransformRepoToCleanedRow<DatabaseRowOutput.Source>;
}

export type SoftwareExtrinsicCreation = SoftwareExtrinsicRow &
    Pick<DatabaseDataType.SoftwareRow, "referencedSinceTime">;

export interface SoftwareRepository {
    // Primary
    create: (params: { software: SoftwareExtrinsicCreation }) => Promise<number>;
    update: (params: { softwareId: number; software: SoftwareExtrinsicRow }) => Promise<void>;
    getSoftwareIdByExternalIdAndSlug: (params: {
        externalId: string;
        sourceSlug: string;
    }) => Promise<number | undefined>;
    getAllO: () => Promise<DatabaseDataType.SoftwareRow[]>;
    // Save = insert or update
    saveSimilarSoftwares: (
        params: {
            softwareId: number;
            externalIds: { sourceSlug: string; externalId: string }[];
        }[]
    ) => Promise<void>;
    getSimilarSoftwareExternalDataPks: (params: {
        softwareId: number;
    }) => Promise<{ sourceSlug: string; externalId: string }[]>;
    // Secondary
    getAll: () => Promise<Software[]>;
    getById: (id: number) => Promise<Software | undefined>;
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

export type PopulatedExternalData = DatabaseDataType.SoftwareExternalDataRow &
    Pick<DatabaseDataType.SourceRow, "url" | "kind" | "slug" | "priority">;

export interface SoftwareExternalDataRepository {
    saveIds: (params: { sourceSlug: string; externalId: string; softwareId?: number }[]) => Promise<void>;
    update: (params: {
        sourceSlug: string;
        externalId: string;
        softwareId?: number;
        lastDataFetchAt?: number;
        softwareExternalData: SoftwareExternalData;
    }) => Promise<void>;
    save: (params: { softwareExternalData: SoftwareExternalData; softwareId: number | undefined }) => Promise<void>; // TODO
    get: (params: {
        sourceSlug: string;
        externalId: string;
    }) => Promise<DatabaseDataType.SoftwareExternalDataRow | undefined>;
    getIds: (params: { minuteSkipSince?: number }) => Promise<
        {
            sourceSlug: string;
            externalId: string;
        }[]
    >;
    getBySoftwareIdAndSource: (params: {
        sourceSlug: string;
        softwareId: number;
    }) => Promise<DatabaseDataType.SoftwareExternalDataRow | undefined>;
    getBySoftwareId: (params: {
        softwareId: number;
    }) => Promise<DatabaseDataType.SoftwareExternalDataRow[] | undefined>;
    getPopulatedBySoftwareId: (params: { softwareId: number }) => Promise<PopulatedExternalData[] | undefined>;
    getBySource: (params: { sourceSlug: string }) => Promise<DatabaseDataType.SoftwareExternalDataRow[] | undefined>;
    getIdsBySource: (params: { sourceSlug: string }) => Promise<string[] | undefined>;
    getAll: () => Promise<DatabaseDataType.SoftwareExternalDataRow[] | undefined>;
    delete: (params: { sourceSlug: string; externalId: string }) => Promise<boolean>;
    getSimilarSoftwareId: (params: { externalId: string; sourceSlug: string }) => Promise<{ softwareId: number }[]>;
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
    getAll: () => Promise<DatabaseDataType.SourceRow[]>;
    getByName: (params: { name: string }) => Promise<DatabaseDataType.SourceRow | undefined>;
    getMainSource: () => Promise<DatabaseDataType.SourceRow>;
    getWikidataSource: () => Promise<DatabaseDataType.SourceRow | undefined>;
}

export type DbApiV2 = {
    source: SourceRepository;
    software: SoftwareRepository;
    softwareExternalData: SoftwareExternalDataRepository;
    otherSoftwareExtraData: OtherSoftwareExtraDataRepository;
    instance: InstanceRepository;
    agent: AgentRepository;
    softwareReferent: SoftwareReferentRepository;
    softwareUser: SoftwareUserRepository;
    getCompiledDataPrivate: () => Promise<CompiledData<"private">>;
};
