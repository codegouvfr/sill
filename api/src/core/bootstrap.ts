import { Kysely } from "kysely";
import { comptoirDuLibreApi } from "./adapters/comptoirDuLibreApi";
import { createKyselyPgDbApi } from "./adapters/dbApi/kysely/createPgDbApi";
import { Database } from "./adapters/dbApi/kysely/kysely.database";
import type { ComptoirDuLibreApi } from "./ports/ComptoirDuLibreApi";
import { DbApiV2 } from "./ports/DbApiV2";
import { UiConfig, uiConfigSchema } from "./uiConfigSchema";
import { UseCasesUsedOnRouter } from "../rpc/router";
import { makeGetAgent } from "./usecases/getAgent";
import { makeGetSoftwareFormAutoFillDataFromExternalAndOtherSources } from "./usecases/getSoftwareFormAutoFillDataFromExternalAndOtherSources";
import rawUiConfig from "../customization/ui-config.json";
import { makeCreateSofware } from "./usecases/createSoftware";
import { makeUpdateSoftware } from "./usecases/updateSoftware";
import { makeRefreshExternalDataForSoftware } from "./usecases/refreshExternalData";

type PgDbConfig = { dbKind: "kysely"; kyselyDb: Kysely<Database> };

type DbConfig = PgDbConfig;

type ParamsOfBootstrapCore = {
    dbConfig: DbConfig;
};

export type Context = {
    paramsOfBootstrapCore: ParamsOfBootstrapCore;
    dbApi: DbApiV2;
    comptoirDuLibreApi: ComptoirDuLibreApi;
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
    const { dbConfig } = params;
    const uiConfig = uiConfigSchema.parse(rawUiConfig);

    const { dbApi } = getDbApiAndInitializeCache(dbConfig);

    const context: Context = {
        "paramsOfBootstrapCore": params,
        dbApi,
        comptoirDuLibreApi
    };

    const useCases: UseCasesUsedOnRouter = {
        getSoftwareFormAutoFillDataFromExternalAndOtherSources:
            makeGetSoftwareFormAutoFillDataFromExternalAndOtherSources(context, {}),
        getAgent: makeGetAgent({ agentRepository: dbApi.agent }),
        fetchAndSaveExternalDataForOneSoftwarePackage: makeRefreshExternalDataForSoftware({ dbApi }),
        createSoftware: makeCreateSofware(dbApi),
        updateSoftware: makeUpdateSoftware(dbApi)
    };

    return { dbApi, context, useCases, uiConfig };
}
