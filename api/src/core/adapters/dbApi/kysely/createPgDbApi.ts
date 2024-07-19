import { Kysely } from "kysely";
import { DbApiV2 } from "../../../ports/DbApiV2";
import { createGetCompiledData } from "./createGetCompiledData";
import { createPgAgentRepository } from "./createPgAgentRepository";
import { createPgInstanceRepository } from "./createPgInstanceRepository";
import { createPgSoftwareRepository } from "./createPgSoftwareRepository";
import { createPgReferentRepository, createPgUserRepository } from "./createPgUserAndReferentRepository";
import { Database } from "./kysely.database";

export const createKyselyPgDbApi = (db: Kysely<Database>): DbApiV2 => {
    return {
        software: createPgSoftwareRepository(db),
        instance: createPgInstanceRepository(db),
        agent: createPgAgentRepository(db),
        softwareReferent: createPgReferentRepository(db),
        softwareUser: createPgUserRepository(db),
        getCompiledDataPrivate: createGetCompiledData(db)
    };
};
