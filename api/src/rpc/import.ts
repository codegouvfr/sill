import { Kysely } from "kysely";
import type { Equals } from "tsafe";
import { assert } from "tsafe/assert";
import { Database } from "../core/adapters/dbApi/kysely/kysely.database";
import { createPgDialect } from "../core/adapters/dbApi/kysely/kysely.dialect";
import type { ExternalDataOrigin } from "../core/ports/GetSoftwareExternalData";
import { importTool } from "../core/importTool";

export async function startImportService(params: {
    isDevEnvironnement: boolean;
    externalSoftwareDataOrigin: ExternalDataOrigin;
    databaseUrl: string;
    botAgentEmail?: string;
    initializeSoftwareFromSource: boolean;
    listToImport?: string[];
}) {
    const {
        isDevEnvironnement,
        externalSoftwareDataOrigin,
        databaseUrl,
        initializeSoftwareFromSource,
        botAgentEmail,
        listToImport,
        ...rest
    } = params;

    assert<Equals<typeof rest, {}>>();

    console.log({ isDevEnvironnement });

    const kyselyDb = new Kysely<Database>({ dialect: createPgDialect(databaseUrl) });

    const success = await importTool({
        "dbConfig": {
            "dbKind": "kysely",
            "kyselyDb": kyselyDb
        },
        "externalSoftwareDataOrigin": externalSoftwareDataOrigin,
        "botAgentEmail": botAgentEmail,
        "listToImport": listToImport ?? []
    });

    success ? console.log("Core API initialized") : console.error("Error");
}
