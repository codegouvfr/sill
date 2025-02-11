import { Kysely } from "kysely";
import { bootstrapCore } from "../src/core";
import type { Database } from "../src/core/adapters/dbApi/kysely/kysely.database";
import { createPgDialect } from "../src/core/adapters/dbApi/kysely/kysely.dialect";
import { env } from "../src/env";

(async () => {
    const kyselyDb = new Kysely<Database>({ dialect: createPgDialect(env.databaseUrl) });
    const { useCases } = await bootstrapCore({
        "dbConfig": {
            "dbKind": "kysely",
            "kyselyDb": kyselyDb
        },
        "githubPersonalAccessTokenForApiRateLimit": env.githubPersonalAccessTokenForApiRateLimit,
        "externalSoftwareDataOrigin": env.externalSoftwareDataOrigin
    });

    await useCases.fetchAndSaveExternalDataForAllSoftwares();

    process.exit(0);
})();
