import {
    DeclarationFormData,
    Instance,
    InstanceFormData,
    Software,
    SoftwareFormData
} from "../usecases/readWriteSillData";
import { CompiledData } from "./CompileData";
import { ExternalDataOrigin } from "./GetSoftwareExternalData";

type Agent = { id: number; email: string; organization: string };
type WithAgent = { agent: Agent };

export interface SoftwareRepository {
    create: (
        params: {
            formData: SoftwareFormData;
            externalDataOrigin: ExternalDataOrigin;
        } & WithAgent
    ) => Promise<void>;
    update: (
        params: {
            softwareSillId: number;
            formData: SoftwareFormData;
        } & WithAgent
    ) => Promise<void>;
    getAll: () => Promise<Software[]>;
    unreference: () => {};
}

export interface InstanceRepository {
    create: (params: { fromData: InstanceFormData } & WithAgent) => Promise<void>;
    update: (
        params: {
            fromData: InstanceFormData;
            instanceId: number;
        } & WithAgent
    ) => Promise<void>;
    getAll: () => Promise<Instance[]>;
}

export interface AgentRepository {
    createUserOrReferent: (params: { fromData: DeclarationFormData; softwareName: string }) => Promise<void>;
    removeUserOrReferent: () => {};
    updateIsProfilePublic: () => {};
    updateAbout: () => {};
    getIsProfilePublic: () => {};
    getByEmail: () => {};
    getAll: () => {};
    changeOrganization: () => {};
    updateEmail: () => {};
    getTotalReferentCount: () => {};
}

export type DbApiV2 = {
    software: SoftwareRepository;
    instance: InstanceRepository;
    agent: AgentRepository;
    getCompiledDataPrivate: () => Promise<CompiledData<"private">>;
};
