import { Database } from "../adapters/dbApi/kysely/kysely.database";
import { Instance, InstanceFormData, Software, SoftwareFormData } from "../usecases/readWriteSillData";
import { OmitFromExisting } from "../utils";
import { CompiledData } from "./CompileData";

import { ExternalDataOrigin } from "./GetSoftwareExternalData";

type WithAgentEmail = { agentEmail: string };

export interface SoftwareRepository {
    create: (
        params: {
            formData: SoftwareFormData;
            externalDataOrigin: ExternalDataOrigin;
        } & WithAgentEmail
    ) => Promise<void>;
    update: (
        params: {
            softwareSillId: number;
            formData: SoftwareFormData;
        } & WithAgentEmail
    ) => Promise<void>;
    getAll: () => Promise<Software[]>;
    unreference: () => {};
}

export interface InstanceRepository {
    create: (params: { fromData: InstanceFormData } & WithAgentEmail) => Promise<void>;
    update: (params: { fromData: InstanceFormData; instanceId: number }) => Promise<void>;
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
    add: (agent: OmitFromExisting<Agent, "id">) => Promise<void>;
    update: (agent: Agent) => Promise<void>;
    remove: (agentId: number) => Promise<void>;
    getByEmail: (email: string) => Promise<Agent | undefined>;
    getAll: () => Promise<Agent[]>;
}

export interface SoftwareReferentRepository {
    add: (params: Database["software_referents"]) => Promise<void>;
    remove: (params: { softwareId: number; agentId: number }) => Promise<void>;
    getTotalCount: () => Promise<number>;
}

export interface SoftwareUserRepository {
    add: (params: Database["software_users"]) => Promise<void>;
    remove: (params: { softwareId: number; agentId: number }) => Promise<void>;
}

export type DbApiV2 = {
    software: SoftwareRepository;
    instance: InstanceRepository;
    agent: AgentRepository;
    softwareReferent: SoftwareReferentRepository;
    softwareUser: SoftwareUserRepository;
    getCompiledDataPrivate: () => Promise<CompiledData<"private">>;
};
