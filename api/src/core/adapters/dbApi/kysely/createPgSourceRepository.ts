// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import { Kysely } from "kysely";
import { SourceRepository } from "../../../ports/DbApiV2";
import { Database } from "./kysely.database";
import { stripNullOrUndefinedValues } from "./kysely.utils";

export const createPgSourceRepository = (db: Kysely<Database>): SourceRepository => ({
    getMainSource: async () =>
        db
            .selectFrom("sources")
            .selectAll()
            .orderBy("priority", "desc")
            .executeTakeFirstOrThrow()
            .then(row => stripNullOrUndefinedValues(row)),
    getWikidataSource: async () =>
        db
            .selectFrom("sources")
            .selectAll()
            .where("kind", "=", "wikidata")
            .orderBy("priority", "desc")
            .executeTakeFirstOrThrow()
            .then(row => stripNullOrUndefinedValues(row))
});
