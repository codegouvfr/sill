import type { Database } from "../adapters/dbApi/kysely/kysely.database";
import type { Agent, Instance, InstanceFormData, Software, SoftwareFormData } from "../usecases/readWriteSillData";
import type { OmitFromExisting } from "../utils";
import type { CompiledData } from "./CompileData";

import type { ExternalDataOrigin } from "./GetSoftwareExternalData";

export type WithAgentId = { agentId: number };

export interface SoftwareRepository {
    create: (
        params: {
            formData: SoftwareFormData;
            externalDataOrigin: ExternalDataOrigin;
        } & WithAgentId
    ) => Promise<number>;
    update: (
        params: {
            softwareSillId: number;
            formData: SoftwareFormData;
        } & WithAgentId
    ) => Promise<void>;
    getAll: () => Promise<Software[]>;
    getById: (id: number) => Promise<Software | undefined>;
    getByName: (name: string) => Promise<Software | undefined>;
    countAddedByAgent: (params: { agentId: number }) => Promise<number>;
    getAllSillSoftwareExternalIds: (externalDataOrigin: ExternalDataOrigin) => Promise<string[]>;
    unreference: (params: { softwareId: number; reason: string; time: number }) => Promise<void>;
}

export interface InstanceRepository {
    create: (params: { formData: InstanceFormData } & WithAgentId) => Promise<number>;
    update: (params: { formData: InstanceFormData; instanceId: number }) => Promise<void>;
    countAddedByAgent: (params: { agentId: number }) => Promise<number>;
    getAll: () => Promise<Instance[]>;
}

export type DbAgent = {
    id: number;
    email: string;
    organization: string;
    about: string | undefined;
    isPublic: boolean;
};

type AgentWithAllDbFields = Agent & Pick<DbAgent, "id">;

export interface AgentRepository {
    add: (agent: OmitFromExisting<DbAgent, "id">) => Promise<number>;
    update: (agent: DbAgent) => Promise<void>;
    remove: (agentId: number) => Promise<void>;
    getByEmail: (email: string) => Promise<AgentWithAllDbFields | undefined>;
    getAll: () => Promise<AgentWithAllDbFields[]>;
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

export type DbApiV2 = {
    software: SoftwareRepository;
    instance: InstanceRepository;
    agent: AgentRepository;
    softwareReferent: SoftwareReferentRepository;
    softwareUser: SoftwareUserRepository;
    getCompiledDataPrivate: () => Promise<CompiledData<"private">>;
};
