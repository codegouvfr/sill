import { Kysely } from "kysely";
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
import type { ComptoirDuLibreApi } from "./ports/ComptoirDuLibreApi";
import { DbApiV2 } from "./ports/DbApiV2";
import type { ExternalDataOrigin, GetSoftwareExternalData } from "./ports/GetSoftwareExternalData";
import type { GetSoftwareExternalDataOptions } from "./ports/GetSoftwareExternalDataOptions";
import type { GetSoftwareLatestVersion } from "./ports/GetSoftwareLatestVersion";
import { UseCases } from "./usecases";
import { makeGetAgent } from "./usecases/getAgent";
import { makeGetSoftwareFormAutoFillDataFromExternalAndOtherSources } from "./usecases/getSoftwareFormAutoFillDataFromExternalAndOtherSources";
import { importFromHALSource, importFromWikidataSource } from "./usecases/importFromSource";

type PgDbConfig = { dbKind: "kysely"; kyselyDb: Kysely<Database> };

type DbConfig = PgDbConfig;

type ParamsOfBootstrapCore = {
    dbConfig: DbConfig;
    githubPersonalAccessTokenForApiRateLimit: string;
    doPerPerformPeriodicalCompilation: boolean;
    doPerformCacheInitialization: boolean;
    externalSoftwareDataOrigin: ExternalDataOrigin;
    initializeSoftwareFromSource: boolean;
    botAgentEmail: string | undefined;
    listToImport?: string[];
};

export type Context = {
    paramsOfBootstrapCore: ParamsOfBootstrapCore;
    dbApi: DbApiV2;
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
        githubPersonalAccessTokenForApiRateLimit,
        doPerPerformPeriodicalCompilation,
        externalSoftwareDataOrigin,
        initializeSoftwareFromSource,
        botAgentEmail,
        listToImport
    } = params;

    const { getSoftwareLatestVersion } = createGetSoftwareLatestVersion({
        githubPersonalAccessTokenForApiRateLimit
    });

    const { getSoftwareExternalData } = getSoftwareExternalDataFunctions(externalSoftwareDataOrigin);

    const { dbApi } = getDbApiAndInitializeCache(dbConfig);

    const context: Context = {
        "paramsOfBootstrapCore": params,
        dbApi,
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

    if (initializeSoftwareFromSource) {
        if (!botAgentEmail) throw new Error("No bot agent email provided");
        if (externalSoftwareDataOrigin === "HAL") {
            console.info(" ------ Feeding database with HAL software started ------");
            const importHAL = importFromHALSource(dbApi);
            try {
                await importHAL(botAgentEmail);
            } catch (err) {
                // catches errors both in fetch and response.json
                console.error(err);
            }

            console.info(" ------ Feeding database with HAL software finished ------");
        }
        if (externalSoftwareDataOrigin === "wikidata") {
            console.info(" ------ Feeding database with Wikidata software started ------");
            const importWikidata = importFromWikidataSource(dbApi);
            try {
                await importWikidata(botAgentEmail, listToImport ?? []);
            } catch (err) {
                console.error(err);
            }
            console.info(" ------ Feeding database with Wikidata software finished ------");
        }
    }

    if (doPerPerformPeriodicalCompilation) {
        const frequencyOfUpdate = 1000 * 60 * 60 * 4; // 4 hours

        const updateSoftwareExternalData = async () => {
            console.info("------ Updating software external data started ------");
            await useCases.fetchAndSaveExternalDataForAllSoftwares();
            console.info("------ Updating software external data finished ------");
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
                "getSoftwareExternalDataOptions": halAdapter.softwareOptions.getByHalId,
                "getSoftwareExternalData": halAdapter.softwareExternalData.getByHalId
            };
        default:
            const unreachableCase: never = externalSoftwareDataOrigin;
            throw new Error(`Unreachable case: ${unreachableCase}`);
    }
}
