import { Kysely } from "kysely";
import { createCore, createObjectThatThrowsIfAccessed, type GenericCore } from "redux-clean-architecture";
import { createCompileData } from "./adapters/compileData";
import { comptoirDuLibreApi } from "./adapters/comptoirDuLibreApi";
import { createKyselyPgDbApi } from "./adapters/dbApi/kysely/createPgDbApi";
import { Database } from "./adapters/dbApi/kysely/kysely.database";
import { getCnllPrestatairesSill } from "./adapters/getCnllPrestatairesSill";
import { getServiceProviders } from "./adapters/getServiceProviders";
import { createGetSoftwareLatestVersion } from "./adapters/getSoftwareLatestVersion";
import { getWikidataSoftware } from "./adapters/wikidata/getWikidataSoftware";
import { getWikidataSoftwareOptions } from "./adapters/wikidata/getWikidataSoftwareOptions";
import { getHalSoftware } from "./adapters/hal/getHalSoftware";
import { getHalSoftwareOptions } from "./adapters/hal/getHalSoftwareOptions";
import { createKeycloakUserApi, type KeycloakUserApiParams } from "./adapters/userApi";
import type { CompileData } from "./ports/CompileData";
import type { ComptoirDuLibreApi } from "./ports/ComptoirDuLibreApi";
import { Db } from "./ports/DbApi";
import { DbApiV2 } from "./ports/DbApiV2";
import type { ExternalDataOrigin, GetSoftwareExternalData } from "./ports/GetSoftwareExternalData";
import type { GetSoftwareExternalDataOptions } from "./ports/GetSoftwareExternalDataOptions";
import type { GetSoftwareLatestVersion } from "./ports/GetSoftwareLatestVersion";
import type { UserApi } from "./ports/UserApi";
import { usecases } from "./usecases";

type PgDbConfig = { dbKind: "kysely"; kyselyDb: Kysely<Database> };

type DbConfig = PgDbConfig;

type ParamsOfBootstrapCore = {
    dbConfig: DbConfig;
    keycloakUserApiParams: KeycloakUserApiParams | undefined;
    githubPersonalAccessTokenForApiRateLimit: string;
    doPerPerformPeriodicalCompilation: boolean;
    doPerformCacheInitialization: boolean;
    externalSoftwareDataOrigin: ExternalDataOrigin;
};

export type Context = {
    paramsOfBootstrapCore: ParamsOfBootstrapCore;
    dbApi: DbApiV2;
    userApi: UserApi;
    compileData: CompileData;
    comptoirDuLibreApi: ComptoirDuLibreApi;
    getSoftwareExternalData: GetSoftwareExternalData;
    getSoftwareLatestVersion: GetSoftwareLatestVersion;
};

export type Core = GenericCore<typeof usecases, Context>;

export type State = Core["types"]["State"];
export type Thunks = Core["types"]["Thunks"];
export type CreateEvt = Core["types"]["CreateEvt"];

const getDbApiAndInitializeCache = (dbConfig: DbConfig): Db.DbApiAndInitializeCache => {
    if (dbConfig.dbKind === "kysely") {
        return {
            dbApi: createKyselyPgDbApi(dbConfig.kyselyDb),
            initializeDbApiCache: async () => {}
        };
    }

    const shouldNotBeReached: never = dbConfig.dbKind;
    throw new Error(`Unsupported case: ${shouldNotBeReached}`);
};

export async function bootstrapCore(
    params: ParamsOfBootstrapCore
): Promise<{ dbApi: DbApiV2; context: Context; core: Core }> {
    const {
        dbConfig,
        keycloakUserApiParams,
        githubPersonalAccessTokenForApiRateLimit,
        doPerPerformPeriodicalCompilation,
        doPerformCacheInitialization,
        externalSoftwareDataOrigin
    } = params;

    const { getSoftwareLatestVersion } = createGetSoftwareLatestVersion({
        githubPersonalAccessTokenForApiRateLimit
    });

    const { getSoftwareExternalData } = getSoftwareExternalDataFunctions(externalSoftwareDataOrigin);

    const { compileData } = createCompileData({
        getSoftwareExternalData,
        getCnllPrestatairesSill,
        comptoirDuLibreApi,
        getSoftwareLatestVersion,
        getServiceProviders
    });

    const { dbApi, initializeDbApiCache } = getDbApiAndInitializeCache(dbConfig);

    const { userApi, initializeUserApiCache } =
        keycloakUserApiParams === undefined
            ? {
                  "userApi": createObjectThatThrowsIfAccessed<Context["userApi"]>({
                      "debugMessage": "No Keycloak server"
                  }),
                  "initializeUserApiCache": async () => {}
              }
            : createKeycloakUserApi(keycloakUserApiParams);

    const context: Context = {
        "paramsOfBootstrapCore": params,
        dbApi,
        userApi,
        compileData,
        comptoirDuLibreApi,
        getSoftwareExternalData,
        getSoftwareLatestVersion
    };

    const { core } = createCore({
        context,
        usecases
    });

    if (doPerPerformPeriodicalCompilation) {
        console.log("TODO: doPerPerformPeriodicalCompilation");
    }
    // await dispatch(
    //     usecases.readWriteSillData.protectedThunks.initialize({
    //         doPerPerformPeriodicalCompilation
    //     })
    // );

    if (doPerformCacheInitialization) {
        console.log("Performing cache initialization...");

        await Promise.all([initializeDbApiCache(), initializeUserApiCache()]);
    }

    return { dbApi, context, core };
}

function getSoftwareExternalDataFunctions(externalSoftwareDataOrigin: ExternalDataOrigin): {
    "getSoftwareExternalDataOptions": GetSoftwareExternalDataOptions;
    "getSoftwareExternalData": GetSoftwareExternalData;
} {
    switch (externalSoftwareDataOrigin) {
        case "wikidata":
            return {
                "getSoftwareExternalDataOptions": getWikidataSoftwareOptions,
                "getSoftwareExternalData": getWikidataSoftware
            };
        case "HAL":
            return {
                "getSoftwareExternalDataOptions": getHalSoftwareOptions,
                "getSoftwareExternalData": getHalSoftware
            };
        default:
            const unreachableCase: never = externalSoftwareDataOrigin;
            throw new Error(`Unreachable case: ${unreachableCase}`);
    }
}
