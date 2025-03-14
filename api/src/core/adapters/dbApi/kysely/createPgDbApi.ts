import { Kysely } from "kysely";
import { DbApiV2 } from "../../../ports/DbApiV2";
import { createGetCompiledData } from "./createGetCompiledData";
import { createPgAgentRepository } from "./createPgAgentRepository";
import { createPgInstanceRepository } from "./createPgInstanceRepository";
import { createPgOtherSoftwareExtraDataRepository } from "./createPgOtherSoftwareExtraDataRepositiory";
import { createPgSoftwareExternalDataRepository } from "./createPgSoftwareExternalDataRepository";
import { createPgSoftwareRepository } from "./createPgSoftwareRepository";
import { createPgReferentRepository, createPgUserRepository } from "./createPgUserAndReferentRepository";
import { Database } from "./kysely.database";
import { createPgSimilarSoftwareRepository } from "./createPgSimilarSoftwareRepository";

export const createKyselyPgDbApi = (db: Kysely<Database>): DbApiV2 => {
    return {
        software: createPgSoftwareRepository(db),
        softwareExternalData: createPgSoftwareExternalDataRepository(db),
        otherSoftwareExtraData: createPgOtherSoftwareExtraDataRepository(db),
        instance: createPgInstanceRepository(db),
        agent: createPgAgentRepository(db),
        softwareReferent: createPgReferentRepository(db),
        softwareUser: createPgUserRepository(db),
        similarSoftware: createPgSimilarSoftwareRepository(db),
        getCompiledDataPrivate: createGetCompiledData(db)
    };
};
