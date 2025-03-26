import { Kysely } from "kysely";
import { comptoirDuLibreApi } from "./adapters/comptoirDuLibreApi";
import { createKyselyPgDbApi } from "./adapters/dbApi/kysely/createPgDbApi";
import { Database } from "./adapters/dbApi/kysely/kysely.database";
import { makeFetchAndSaveExternalDataForAllSoftwares } from "./adapters/fetchExternalData";
import { getCnllPrestatairesSill } from "./adapters/getCnllPrestatairesSill";
import { getServiceProviders } from "./adapters/getServiceProviders";
import { wikidataSourceGateway } from "./adapters/wikidata";
import { halSourceGateway } from "./adapters/hal";
import { DbApiV2 } from "./ports/DbApiV2";
import type { ExternalDataOrigin, GetSoftwareExternalData } from "./ports/GetSoftwareExternalData";
import type { GetSoftwareExternalDataOptions } from "./ports/GetSoftwareExternalDataOptions";

type PgDbConfig = { dbKind: "kysely"; kyselyDb: Kysely<Database> };

type DbConfig = PgDbConfig;

type ParamsOfUpdateService = {
    dbConfig: DbConfig;
    githubPersonalAccessTokenForApiRateLimit: string;
    externalSoftwareDataOrigin: ExternalDataOrigin;
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

export async function updateTool(params: ParamsOfUpdateService): Promise<boolean> {
    const { dbConfig, externalSoftwareDataOrigin } = params;

    const { getSoftwareExternalData } = getSoftwareExternalDataFunctions(externalSoftwareDataOrigin);

    const { dbApi } = getDbApiAndInitializeCache(dbConfig);

    const wikidataSource = await dbApi.source.getWikidataSource();

    const fetchAndSaveExternalDataForAllSoftwares = await makeFetchAndSaveExternalDataForAllSoftwares({
        getSoftwareExternalData,
        getCnllPrestatairesSill,
        comptoirDuLibreApi,
        getServiceProviders,
        wikidataSource,
        dbApi
    });
    console.info("------ Updating software external data started ------");
    await fetchAndSaveExternalDataForAllSoftwares();
    console.info("------ Updating software external data finished ------");

    return Promise.resolve(true);
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
