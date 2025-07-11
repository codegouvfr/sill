// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import type { Database, DatabaseRowOutput } from "../adapters/dbApi/kysely/kysely.database";
import { TransformRepoToCleanedRow } from "../adapters/dbApi/kysely/kysely.utils";
import type { Agent, Instance, InstanceFormData } from "../usecases/readWriteSillData";
import type { OmitFromExisting } from "../utils";
import type { CompiledData } from "./CompileData";

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
    getBySoftwareId: (id: number) => Promise<DatabaseDataType.SoftwareRow | undefined>;
    getByName: (params: { softwareName: string }) => Promise<DatabaseDataType.SoftwareRow | undefined>;
    // Save = insert or update
    saveSimilarSoftwares: (
        params: {
            softwareId: number;
            externalIds: { sourceSlug: string; externalId: string }[];
        }[]
    ) => Promise<void>;
    getSimilarSoftwareExternalDataPks: (params: {
        softwareId: number;
    }) => Promise<{ sourceSlug: string; externalId: string; softwareId: number | undefined }[]>;
    // Secondary
    // getAll: () => Promise<Software[]>;
    // getById: (id: number) => Promise<Software | undefined>;
    // getByIdWithLinkedSoftwaresExternalIds: (id: number) => Promise<
    //     | {
    //           software: Software;
    //           similarSoftwaresExternalIds: string[];
    //       }
    //     | undefined
    // >;
    // getByName: (name: string) => Promise<Software | undefined>;
    countAddedByAgent: (params: { agentId: number }) => Promise<number>;
    getAllSillSoftwareExternalIds: (sourceSlug: string) => Promise<string[]>;
    unreference: (params: { softwareId: number; reason: string; time: number }) => Promise<void>;
    getUserAndReferentCountByOrganization: (params: { softwareId: number }) => Promise<
        Record<
            string,
            {
                userCount: number;
                referentCount: number;
            }
        >
    >;
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
    getBySource: (params: { sourceSlug: string }) => Promise<DatabaseDataType.SoftwareExternalDataRow[] | undefined>;
    getIdsBySource: (params: { sourceSlug: string }) => Promise<string[] | undefined>;
    getAll: () => Promise<DatabaseDataType.SoftwareExternalDataRow[] | undefined>;
    delete: (params: { sourceSlug: string; externalId: string }) => Promise<boolean>;
    getSimilarSoftwareId: (params: { externalId: string; sourceSlug: string }) => Promise<{ softwareId: number }[]>;
    getOtherIdentifierIdsBySourceURL: (params: { sourceURL: string }) => Promise<Record<string, number> | undefined>;
    // Secondary
    getMergedBySoftwareId: (params: {
        softwareId: number;
    }) => Promise<DatabaseDataType.SoftwareExternalDataRow | undefined>;
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
    instance: InstanceRepository;
    agent: AgentRepository;
    softwareReferent: SoftwareReferentRepository;
    softwareUser: SoftwareUserRepository;
    getCompiledDataPrivate: () => Promise<CompiledData<"private">>;
};
