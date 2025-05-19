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
    getByName: async (params: { name: string }) =>
        db
            .selectFrom("sources")
            .selectAll()
            .where("slug", "=", params.name)
            .orderBy("priority", "asc")
            .executeTakeFirst()
            .then(row => (row ? stripNullOrUndefinedValues(row) : row)),
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
