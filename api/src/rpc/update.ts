import { Kysely } from "kysely";
import type { Equals } from "tsafe";
import { assert } from "tsafe/assert";
import { Database } from "../core/adapters/dbApi/kysely/kysely.database";
import { createPgDialect } from "../core/adapters/dbApi/kysely/kysely.dialect";
import type { ExternalDataOrigin } from "../core/ports/GetSoftwareExternalData";
import { updateTool } from "../core/updateTools";

export async function startUpdateService(params: {
    githubPersonalAccessTokenForApiRateLimit: string;
    isDevEnvironnement: boolean;
    externalSoftwareDataOrigin: ExternalDataOrigin;
    databaseUrl: string;
}) {
    const {
        githubPersonalAccessTokenForApiRateLimit,
        isDevEnvironnement,
        externalSoftwareDataOrigin,
        databaseUrl,
        ...rest
    } = params;

    assert<Equals<typeof rest, {}>>();

    console.log({ isDevEnvironnement });

    const kyselyDb = new Kysely<Database>({ dialect: createPgDialect(databaseUrl) });

    const result = await updateTool({
        "dbConfig": {
            "dbKind": "kysely",
            "kyselyDb": kyselyDb
        },
        githubPersonalAccessTokenForApiRateLimit,
        "externalSoftwareDataOrigin": externalSoftwareDataOrigin
    });

    console.log("Update sucessfull", result);
}
