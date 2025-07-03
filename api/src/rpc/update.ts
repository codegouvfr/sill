// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import { Kysely } from "kysely";
import type { Equals } from "tsafe";
import { assert } from "tsafe/assert";
import { Database } from "../core/adapters/dbApi/kysely/kysely.database";
import { createPgDialect } from "../core/adapters/dbApi/kysely/kysely.dialect";
import type { ExternalDataOrigin } from "../core/ports/GetSoftwareExternalData";
import { updateTool } from "../core/updateTools";

export async function startUpdateService(params: {
    isDevEnvironnement: boolean;
    externalSoftwareDataOrigin: ExternalDataOrigin;
    databaseUrl: string;
}) {
    const { isDevEnvironnement, externalSoftwareDataOrigin, databaseUrl, ...rest } = params;

    assert<Equals<typeof rest, {}>>();

    console.log({ isDevEnvironnement });

    const kyselyDb = new Kysely<Database>({ dialect: createPgDialect(databaseUrl) });

    const result = await updateTool({
        "dbConfig": {
            "dbKind": "kysely",
            "kyselyDb": kyselyDb
        },
        "externalSoftwareDataOrigin": externalSoftwareDataOrigin
    });

    console.log("Update sucessfull", result);
}
