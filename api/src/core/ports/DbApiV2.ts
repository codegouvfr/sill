import type { Database } from "../adapters/dbApi/kysely/kysely.database";
import type { Instance, InstanceFormData, Software, SoftwareFormData } from "../usecases/readWriteSillData";
import type { OmitFromExisting } from "../utils";
import type { CompiledData } from "./CompileData";

import type { ExternalDataOrigin } from "./GetSoftwareExternalData";

export type WithAgentEmail = { agentEmail: string };

export interface SoftwareRepository {
    create: (
        params: {
            formData: SoftwareFormData;
            externalDataOrigin: ExternalDataOrigin;
        } & WithAgentEmail
    ) => Promise<number>;
    update: (
        params: {
            softwareSillId: number;
            formData: SoftwareFormData;
        } & WithAgentEmail
    ) => Promise<void>;
    getAll: () => Promise<Software[]>;
    getById: (id: number) => Promise<Software | undefined>;
    countAddedByAgent: (params: { agentEmail: string }) => Promise<number>;
    getAllSillSoftwareExternalIds: (externalDataOrigin: ExternalDataOrigin) => Promise<string[]>;
    unreference: (params: { softwareId: number; reason: string; time: number }) => Promise<void>;
}

export interface InstanceRepository {
    create: (params: { formData: InstanceFormData } & WithAgentEmail) => Promise<number>;
    update: (params: { formData: InstanceFormData; instanceId: number }) => Promise<void>;
    getAll: () => Promise<Instance[]>;
}

export type Agent = {
    id: number;
    email: string;
    organization: string;
    about: string | undefined;
    isPublic: boolean;
};

export interface AgentRepository {
    add: (agent: OmitFromExisting<Agent, "id">) => Promise<number>;
    update: (agent: Agent) => Promise<void>;
    remove: (agentId: number) => Promise<void>;
    getByEmail: (email: string) => Promise<Agent | undefined>;
    getAll: () => Promise<Agent[]>;
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
