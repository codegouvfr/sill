import { Kysely } from "kysely";
import { comptoirDuLibreApi } from "./adapters/comptoirDuLibreApi";
import { createKyselyPgDbApi } from "./adapters/dbApi/kysely/createPgDbApi";
import { Database } from "./adapters/dbApi/kysely/kysely.database";
import { makeFetchAndSaveExternalDataForAllSoftwares } from "./adapters/fetchExternalData";
import { getCnllPrestatairesSill } from "./adapters/getCnllPrestatairesSill";
import { getServiceProviders } from "./adapters/getServiceProviders";
import { wikidataAdapter } from "./adapters/wikidata";
import { halAdapter } from "./adapters/hal";
import type { ComptoirDuLibreApi } from "./ports/ComptoirDuLibreApi";
import { DbApiV2 } from "./ports/DbApiV2";
import type { ExternalDataOrigin, GetSoftwareExternalData } from "./ports/GetSoftwareExternalData";
import type { GetSoftwareExternalDataOptions } from "./ports/GetSoftwareExternalDataOptions";
import { UseCases } from "./usecases";
import { makeGetAgent } from "./usecases/getAgent";
import { makeGetSoftwareFormAutoFillDataFromExternalAndOtherSources } from "./usecases/getSoftwareFormAutoFillDataFromExternalAndOtherSources";

type PgDbConfig = { dbKind: "kysely"; kyselyDb: Kysely<Database> };

type DbConfig = PgDbConfig;

type ParamsOfBootstrapCore = {
    dbConfig: DbConfig;
    githubPersonalAccessTokenForApiRateLimit: string;
    externalSoftwareDataOrigin: ExternalDataOrigin;
};

export type Context = {
    paramsOfBootstrapCore: ParamsOfBootstrapCore;
    dbApi: DbApiV2;
    comptoirDuLibreApi: ComptoirDuLibreApi;
    getSoftwareExternalData: GetSoftwareExternalData;
};

export const getDbApiAndInitializeCache = (dbConfig: DbConfig): { dbApi: DbApiV2 } => {
    if (dbConfig.dbKind === "kysely") {
        return {
            dbApi: createKyselyPgDbApi(dbConfig.kyselyDb)
        };
    }

    const shouldNotBeReached: never = dbConfig.dbKind;
    throw new Error(`Unsupported case: ${shouldNotBeReached}`);
};

export async function bootstrapCore(
    params: ParamsOfBootstrapCore
): Promise<{ dbApi: DbApiV2; context: Context; useCases: UseCases }> {
    const { dbConfig, externalSoftwareDataOrigin } = params;

    const { getSoftwareExternalData } = getSoftwareExternalDataFunctions(externalSoftwareDataOrigin);

    const { dbApi } = getDbApiAndInitializeCache(dbConfig);

    const context: Context = {
        "paramsOfBootstrapCore": params,
        dbApi,
        comptoirDuLibreApi,
        getSoftwareExternalData
    };

    const useCases: UseCases = {
        getSoftwareFormAutoFillDataFromExternalAndOtherSources:
            makeGetSoftwareFormAutoFillDataFromExternalAndOtherSources(context, {}),
        fetchAndSaveExternalDataForAllSoftwares: makeFetchAndSaveExternalDataForAllSoftwares({
            getSoftwareExternalData,
            getCnllPrestatairesSill,
            comptoirDuLibreApi,
            getServiceProviders,
            dbApi
        }),
        getAgent: makeGetAgent({ agentRepository: dbApi.agent })
    };

    return { dbApi, context, useCases };
}

function getSoftwareExternalDataFunctions(externalSoftwareDataOrigin: ExternalDataOrigin): {
    "getSoftwareExternalDataOptions": GetSoftwareExternalDataOptions;
    "getSoftwareExternalData": GetSoftwareExternalData;
} {
    switch (externalSoftwareDataOrigin) {
        case "wikidata":
            return {
                "getSoftwareExternalDataOptions": wikidataAdapter.softwareOptions.getById,
                "getSoftwareExternalData": wikidataAdapter.softwareExternalData.getById
            };
        case "HAL":
            return {
                "getSoftwareExternalDataOptions": halAdapter.softwareOptions.getById,
                "getSoftwareExternalData": halAdapter.softwareExternalData.getById
            };
        default:
            const unreachableCase: never = externalSoftwareDataOrigin;
            throw new Error(`Unreachable case: ${unreachableCase}`);
    }
}
