import { Kysely } from "kysely";
import { comptoirDuLibreApi } from "./adapters/comptoirDuLibreApi";
import { createKyselyPgDbApi } from "./adapters/dbApi/kysely/createPgDbApi";
import { Database } from "./adapters/dbApi/kysely/kysely.database";
import { wikidataSourceGateway } from "./adapters/wikidata";
import { halSourceGateway } from "./adapters/hal";
import type { ComptoirDuLibreApi } from "./ports/ComptoirDuLibreApi";
import { DbApiV2 } from "./ports/DbApiV2";
import type { ExternalDataOrigin, GetSoftwareExternalData } from "./ports/GetSoftwareExternalData";
import type { GetSoftwareExternalDataOptions } from "./ports/GetSoftwareExternalDataOptions";
import { UiConfig, uiConfigSchema } from "./uiConfigSchema";
import { UseCasesUsedOnRouter } from "../rpc/router";
import { makeGetAgent } from "./usecases/getAgent";
import { makeGetSoftwareFormAutoFillDataFromExternalAndOtherSources } from "./usecases/getSoftwareFormAutoFillDataFromExternalAndOtherSources";
import rawUiConfig from "../customization/ui-config.json";
import { makeCreateSofware } from "./usecases/createSoftware";
import { makeUpdateSoftware } from "./usecases/updateSoftware";

type PgDbConfig = { dbKind: "kysely"; kyselyDb: Kysely<Database> };

type DbConfig = PgDbConfig;

type ParamsOfBootstrapCore = {
    dbConfig: DbConfig;
    externalSoftwareDataOrigin: ExternalDataOrigin;
};

export type Context = {
    paramsOfBootstrapCore: ParamsOfBootstrapCore;
    dbApi: DbApiV2;
    comptoirDuLibreApi: ComptoirDuLibreApi;
    getSoftwareExternalData: GetSoftwareExternalData;
};

const getDbApiAndInitializeCache = (dbConfig: DbConfig): { dbApi: DbApiV2 } => {
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
): Promise<{ dbApi: DbApiV2; context: Context; useCases: UseCasesUsedOnRouter; uiConfig: UiConfig }> {
    const { dbConfig, externalSoftwareDataOrigin } = params;
    const uiConfig = uiConfigSchema.parse(rawUiConfig);

    const { getSoftwareExternalData } = getSoftwareExternalDataFunctions(externalSoftwareDataOrigin);

    const { dbApi } = getDbApiAndInitializeCache(dbConfig);

    const context: Context = {
        "paramsOfBootstrapCore": params,
        dbApi,
        comptoirDuLibreApi,
        getSoftwareExternalData
    };

    const useCases: UseCasesUsedOnRouter = {
        getSoftwareFormAutoFillDataFromExternalAndOtherSources:
            makeGetSoftwareFormAutoFillDataFromExternalAndOtherSources(context, {}),
        getAgent: makeGetAgent({ agentRepository: dbApi.agent }),
        createSoftware: makeCreateSofware(dbApi),
        updateSoftware: makeUpdateSoftware(dbApi)
    };

    return { dbApi, context, useCases, uiConfig };
}

function getSoftwareExternalDataFunctions(externalSoftwareDataOrigin: ExternalDataOrigin): {
    "getSoftwareExternalDataOptions": GetSoftwareExternalDataOptions;
    "getSoftwareExternalData": GetSoftwareExternalData;
} {
    switch (externalSoftwareDataOrigin) {
        case "wikidata":
            return {
                "getSoftwareExternalDataOptions": wikidataSourceGateway.softwareOptions.getById,
                "getSoftwareExternalData": wikidataSourceGateway.softwareExternalData.getById
            };
        case "HAL":
            return {
                "getSoftwareExternalDataOptions": halSourceGateway.softwareOptions.getById,
                "getSoftwareExternalData": halSourceGateway.softwareExternalData.getById
            };
        default:
            const unreachableCase: never = externalSoftwareDataOrigin;
            throw new Error(`Unreachable case: ${unreachableCase}`);
    }
}
