import { Kysely } from "kysely";
import type { Equals } from "tsafe";
import { assert } from "tsafe/assert";
import { Database } from "../core/adapters/dbApi/kysely/kysely.database";
import { createPgDialect } from "../core/adapters/dbApi/kysely/kysely.dialect";
import { getDbApiAndInitializeCache } from "../core/adapters/dbApi/kysely/createPgDbApi";
import { makeSelfImportFromIdentifiers } from "../core/usecases/selfImport";

export async function startSelfImportService(params: {
    isDevEnvironnement: boolean;
    databaseUrl: string;
    botAgentEmail?: string;
    importDataSourceOrigin: string;
    listToImport?: string[];
}) {
    const { isDevEnvironnement, databaseUrl, botAgentEmail, listToImport, importDataSourceOrigin, ...rest } = params;

    assert<Equals<typeof rest, {}>>();

    console.log({ isDevEnvironnement });

    const kyselyDb = new Kysely<Database>({ dialect: createPgDialect(databaseUrl) });
    const { dbApi } = getDbApiAndInitializeCache({
        "dbKind": "kysely",
        "kyselyDb": kyselyDb
    });

    const selfImport = makeSelfImportFromIdentifiers({ dbApi });

    const success = await selfImport();

    success ? console.info("[RPC:Self-Import] ✅ Self-Importation successful ✅") : console.error("[RPC:Self-Import] ❌ Error ❌");
}
