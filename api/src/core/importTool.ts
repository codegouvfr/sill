import { Kysely } from "kysely";
import { createKyselyPgDbApi } from "./adapters/dbApi/kysely/createPgDbApi";
import { Database } from "./adapters/dbApi/kysely/kysely.database";
import { DbApiV2 } from "./ports/DbApiV2";
import { importFromSource } from "./usecases/importFromSource";

type PgDbConfig = { dbKind: "kysely"; kyselyDb: Kysely<Database> };

type DbConfig = PgDbConfig;

type ParamsOfImportTool = {
    dbConfig: DbConfig;
    botAgentEmail: string | undefined;
    listToImport?: string[];
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

export async function importTool(params: ParamsOfImportTool): Promise<boolean> {
    const { dbConfig, botAgentEmail, listToImport } = params;

    const { dbApi } = getDbApiAndInitializeCache(dbConfig);

    if (!botAgentEmail) throw new Error("No bot agent email provided");

    // Todo Choose Source
    const mainSource = await dbApi.source.getMainSource();

    const importService = importFromSource(dbApi);

    console.time(`[Import] Feeding database with software package from ${mainSource.slug}`);
    return importService({ agentEmail: botAgentEmail, source: mainSource, softwareIdOnSource: listToImport }).then(
        promises =>
            Promise.all(promises).then(() => {
                console.timeEnd(`[Import] Feeding database with software package from ${mainSource.slug}`);
                return true;
            })
    );
}
