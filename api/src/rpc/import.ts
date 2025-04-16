// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import { Kysely } from "kysely";
import type { Equals } from "tsafe";
import { assert } from "tsafe/assert";
import { Database } from "../core/adapters/dbApi/kysely/kysely.database";
import { createPgDialect } from "../core/adapters/dbApi/kysely/kysely.dialect";
import { importTool } from "../core/importTool";

export async function startImportService(params: {
    isDevEnvironnement: boolean;
    databaseUrl: string;
    botAgentEmail?: string;
    initializeSoftwareFromSource: boolean;
    listToImport?: string[];
}) {
    const { isDevEnvironnement, databaseUrl, initializeSoftwareFromSource, botAgentEmail, listToImport, ...rest } =
        params;

    assert<Equals<typeof rest, {}>>();

    console.log({ isDevEnvironnement });

    const kyselyDb = new Kysely<Database>({ dialect: createPgDialect(databaseUrl) });

    const success = await importTool({
        "dbConfig": {
            "dbKind": "kysely",
            "kyselyDb": kyselyDb
        },
        "botAgentEmail": botAgentEmail,
        "listToImport": listToImport ?? []
    });

    success ? console.log("Importation successful") : console.error("Error");
}
