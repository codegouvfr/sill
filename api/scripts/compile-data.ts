import { Kysely } from "kysely";
import { bootstrapCore } from "../src/core";
import type { Database } from "../src/core/adapters/dbApi/kysely/kysely.database";
import { createPgDialect } from "../src/core/adapters/dbApi/kysely/kysely.dialect";
import { env } from "../src/env";

(async () => {
    const kyselyDb = new Kysely<Database>({ dialect: createPgDialect(env.databaseUrl) });
    const { useCases } = await bootstrapCore({
        "keycloakUserApiParams": undefined,
        "dbConfig": {
            "dbKind": "kysely",
            "kyselyDb": kyselyDb
        },
        "githubPersonalAccessTokenForApiRateLimit": env.githubPersonalAccessTokenForApiRateLimit,
        "doPerPerformPeriodicalCompilation": false,
        "doPerformCacheInitialization": false,
        "externalSoftwareDataOrigin": env.externalSoftwareDataOrigin,
        "initializeSoftwareFromSource": env.initializeSoftwareFromSource,
        "botAgentEmail": env.botAgentEmail
    });

    await useCases.fetchAndSaveExternalDataForAllSoftwares();

    process.exit(0);
})();
