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
    sourceSlug: string;
    listToImport?: string[];
};

const getDbApiAndInitializeCache = (dbConfig: DbConfig): { dbApi: DbApiV2 } => {
    if (dbConfig.dbKind === "kysely") {
        return {
            dbApi: createKyselyPgDbApi(dbConfig.kyselyDb)
        };
    }

    const shouldNotBeReached: never = dbConfig.dbKind;
    throw new Error(`[Loader:Import] Unsupported case: ${shouldNotBeReached}`);
};

export async function importTool(params: ParamsOfImportTool): Promise<boolean> {
    const { dbConfig, botAgentEmail, listToImport, sourceSlug } = params;

    const { dbApi } = getDbApiAndInitializeCache(dbConfig);

    if (!botAgentEmail) throw new Error("[Loader:Import] No bot agent email provided");

    // Todo Choose Source
    const source = await dbApi.source.getByName({ name: sourceSlug });
    if (!source) throw new Error("[Loader:Import] Couldn't find the source to connect to");

    const importService = importFromSource(dbApi);

    console.time(`[Loader:Import] Feeding database with software package from ${source.slug}`);
    return importService({ agentEmail: botAgentEmail, source, softwareIdOnSource: listToImport }).then(promises =>
        Promise.all(promises).then(() => {
            console.timeEnd(`[Loader:Import] Feeding database with software package from ${source.slug}`);
            return true;
        })
    );
}
