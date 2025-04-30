import { Kysely } from "kysely";
import { SourceRepository } from "../../../ports/DbApiV2";
import { Database } from "./kysely.database";
import { stripNullOrUndefinedValues } from "./kysely.utils";

export const createPgSourceRepository = (db: Kysely<Database>): SourceRepository => ({
    getAll: async () =>
        db
            .selectFrom("sources")
            .selectAll()
            .execute()
            .then(rows => rows.map(row => stripNullOrUndefinedValues(row))),
    getMainSource: async () =>
        db
            .selectFrom("sources")
            .selectAll()
            .orderBy("priority", "asc")
            .executeTakeFirstOrThrow()
            .then(row => stripNullOrUndefinedValues(row)),
    getWikidataSource: async () =>
        db
            .selectFrom("sources")
            .selectAll()
            .where("kind", "=", "wikidata")
            .orderBy("priority", "asc")
            .executeTakeFirstOrThrow()
            .then(row => stripNullOrUndefinedValues(row))
});
