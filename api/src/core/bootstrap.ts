import { Kysely } from "kysely";
import { createObjectThatThrowsIfAccessed } from "../tools/createObjectThatThrowsIfAccessed";
import { comptoirDuLibreApi } from "./adapters/comptoirDuLibreApi";
import { createKyselyPgDbApi } from "./adapters/dbApi/kysely/createPgDbApi";
import { Database } from "./adapters/dbApi/kysely/kysely.database";
import { makeFetchAndSaveExternalDataForAllSoftwares } from "./adapters/fetchExternalData";
import { getCnllPrestatairesSill } from "./adapters/getCnllPrestatairesSill";
import { getServiceProviders } from "./adapters/getServiceProviders";
import { createGetSoftwareLatestVersion } from "./adapters/getSoftwareLatestVersion";
import { getWikidataSoftware } from "./adapters/wikidata/getWikidataSoftware";
import { getWikidataSoftwareOptions } from "./adapters/wikidata/getWikidataSoftwareOptions";
import { halAdapter } from "./adapters/hal";
import { getHalSoftwareOptions } from "./adapters/hal/getHalSoftwareOptions";
import { createKeycloakUserApi, type KeycloakUserApiParams } from "./adapters/userApi";
import type { ComptoirDuLibreApi } from "./ports/ComptoirDuLibreApi";
import { DbApiV2 } from "./ports/DbApiV2";
import type { ExternalDataOrigin, GetSoftwareExternalData } from "./ports/GetSoftwareExternalData";
import type { GetSoftwareExternalDataOptions } from "./ports/GetSoftwareExternalDataOptions";
import type { GetSoftwareLatestVersion } from "./ports/GetSoftwareLatestVersion";
import type { UserApi } from "./ports/UserApi";
import { UseCases } from "./usecases";
import { makeGetAgent } from "./usecases/getAgent";
import { makeGetSoftwareFormAutoFillDataFromExternalAndOtherSources } from "./usecases/getSoftwareFormAutoFillDataFromExternalAndOtherSources";
import { importFromHALSource } from "./usecases/importFromSource";

type PgDbConfig = { dbKind: "kysely"; kyselyDb: Kysely<Database> };

type DbConfig = PgDbConfig;

type ParamsOfBootstrapCore = {
    dbConfig: DbConfig;
    keycloakUserApiParams: KeycloakUserApiParams | undefined;
    githubPersonalAccessTokenForApiRateLimit: string;
    doPerPerformPeriodicalCompilation: boolean;
    doPerformCacheInitialization: boolean;
    externalSoftwareDataOrigin: ExternalDataOrigin;
    initializeSoftwareFromSource: boolean;
    botAgentEmail: string | undefined;
};

export type Context = {
    paramsOfBootstrapCore: ParamsOfBootstrapCore;
    dbApi: DbApiV2;
    userApi: UserApi;
    comptoirDuLibreApi: ComptoirDuLibreApi;
    getSoftwareExternalData: GetSoftwareExternalData;
    getSoftwareLatestVersion: GetSoftwareLatestVersion;
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
): Promise<{ dbApi: DbApiV2; context: Context; useCases: UseCases }> {
    const {
        dbConfig,
        keycloakUserApiParams,
        githubPersonalAccessTokenForApiRateLimit,
        doPerPerformPeriodicalCompilation,
        doPerformCacheInitialization,
        externalSoftwareDataOrigin,
        initializeSoftwareFromSource,
        botAgentEmail
    } = params;

    const { getSoftwareLatestVersion } = createGetSoftwareLatestVersion({
        githubPersonalAccessTokenForApiRateLimit
    });

    const { getSoftwareExternalData } = getSoftwareExternalDataFunctions(externalSoftwareDataOrigin);

    const { dbApi } = getDbApiAndInitializeCache(dbConfig);

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
        comptoirDuLibreApi,
        getSoftwareExternalData,
        getSoftwareLatestVersion
    };

    const useCases: UseCases = {
        getSoftwareFormAutoFillDataFromExternalAndOtherSources:
            makeGetSoftwareFormAutoFillDataFromExternalAndOtherSources(context, {}),
        fetchAndSaveExternalDataForAllSoftwares: makeFetchAndSaveExternalDataForAllSoftwares({
            getSoftwareExternalData,
            getCnllPrestatairesSill,
            comptoirDuLibreApi,
            getSoftwareLatestVersion,
            getServiceProviders,
            dbApi
        }),
        getAgent: makeGetAgent({ agentRepository: dbApi.agent })
    };

    if (doPerformCacheInitialization) {
        console.log("Performing user cache initialization...");
        await initializeUserApiCache();
    }

    if (initializeSoftwareFromSource) {
        if (externalSoftwareDataOrigin === "HAL") {
            console.log(" ------ Feeding database with HAL software started ------");
            if (!botAgentEmail) throw new Error("No bot agent email provided");
            const importHAL = importFromHALSource(dbApi);
            try {
                await importHAL(botAgentEmail);
            } catch (err) {
                // catches errors both in fetch and response.json
                console.error(err);
            }

            console.log(" ------ Feeding database with HAL software finished ------");
        }
    }

    if (doPerPerformPeriodicalCompilation) {
        const frequencyOfUpdate = 1000 * 60 * 60 * 4; // 4 hours

        const updateSoftwareExternalData = async () => {
            console.log("------ Updating software external data started ------");
            await useCases.fetchAndSaveExternalDataForAllSoftwares();
            console.log("------ Updating software external data finished ------");
            setTimeout(async () => {
                await updateSoftwareExternalData();
            }, frequencyOfUpdate);
        };

        // start the periodical compilation 15 secondes after api starts
        void setTimeout(() => updateSoftwareExternalData(), 1000 * 15);
    }

    return { dbApi, context, useCases };
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
                "getSoftwareExternalData": halAdapter.softwareExternalData.getByHalId
            };
        default:
            const unreachableCase: never = externalSoftwareDataOrigin;
            throw new Error(`Unreachable case: ${unreachableCase}`);
    }
}
