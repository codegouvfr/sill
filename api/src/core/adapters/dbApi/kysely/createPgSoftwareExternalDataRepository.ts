import { Kysely } from "kysely";
import { SoftwareExternalDataRepository } from "../../../ports/DbApiV2";
import { Database } from "./kysely.database";
import { stripNullOrUndefinedValues } from "./kysely.utils";

export const createPgSoftwareExternalDataRepository = (db: Kysely<Database>): SoftwareExternalDataRepository => ({
    insert: async params => {
        const { externalId, sourceSlug, softwareId } = params;

        await db
            .insertInto("software_external_datas")
            .values({
                externalId,
                sourceSlug,
                softwareId,
                developers: JSON.stringify([]),
                label: JSON.stringify({}),
                description: JSON.stringify({})
            })
            .executeTakeFirst();
    },
    update: async params => {
        const { externalId, sourceSlug, softwareExternalData, softwareId, lastDataFetchAt } = params;

        await db
            .updateTable("software_external_datas")
            .where("externalId", "=", externalId)
            .where("sourceSlug", "=", sourceSlug)
            .set({
                ...softwareExternalData,
                softwareId,
                lastDataFetchAt,
                developers: JSON.stringify(softwareExternalData.developers),
                label: JSON.stringify(softwareExternalData.label),
                keywords: JSON.stringify(softwareExternalData.keywords),
                applicationCategories: JSON.stringify(softwareExternalData.applicationCategories),
                programmingLanguages: JSON.stringify(softwareExternalData.programmingLanguages),
                referencePublications: JSON.stringify(softwareExternalData.referencePublications),
                identifiers: JSON.stringify(softwareExternalData.identifiers),
                description: JSON.stringify(softwareExternalData.description)
            })
            .executeTakeFirst();
    },
    save: async ({ softwareExternalData, softwareId }) => {
        const pgValues = {
            ...softwareExternalData,
            softwareId,
            developers: JSON.stringify(softwareExternalData.developers),
            label: JSON.stringify(softwareExternalData.label),
            keywords: JSON.stringify(softwareExternalData.keywords),
            applicationCategories: JSON.stringify(softwareExternalData.applicationCategories),
            programmingLanguages: JSON.stringify(softwareExternalData.programmingLanguages),
            referencePublications: JSON.stringify(softwareExternalData.referencePublications),
            identifiers: JSON.stringify(softwareExternalData.identifiers),
            description: JSON.stringify(softwareExternalData.description)
        };

        await db
            .insertInto("software_external_datas")
            .values(pgValues)
            .onConflict(oc => oc.column("externalId").doUpdateSet(pgValues))
            .executeTakeFirst();
    },
    get: async ({ sourceSlug, externalId }) => {
        return db
            .selectFrom("software_external_datas")
            .selectAll()
            .where("externalId", "=", externalId)
            .where("sourceSlug", "=", sourceSlug)
            .executeTakeFirst()
            .then(row => (row ? stripNullOrUndefinedValues(row) : undefined));
    },
    getIds: async ({ skipSince }) => {
        let request = db.selectFrom("software_external_datas").select(["externalId", "sourceSlug"]);

        if (skipSince) {
            const dateNum = new Date().valueOf() - skipSince * 1000;
            request = request.where(eb =>
                eb.or([eb("lastDataFetchAt", "is", null), eb("lastDataFetchAt", "<", dateNum)])
            );
        }

        return request.execute().then(rows => rows.map(row => stripNullOrUndefinedValues(row)));
    },
    getBySoftwareIdAndSource: async ({ softwareId, sourceSlug }) => {
        return db
            .selectFrom("software_external_datas")
            .selectAll()
            .where("softwareId", "=", softwareId)
            .where("sourceSlug", "=", sourceSlug)
            .executeTakeFirst()
            .then(row => (row ? stripNullOrUndefinedValues(row) : undefined));
    },
    getBySoftwareId: async ({ softwareId }) => {
        return db
            .selectFrom("software_external_datas")
            .selectAll()
            .where("softwareId", "=", softwareId)
            .execute()
            .then(rows => rows.map(row => stripNullOrUndefinedValues(row)));
    },
    getIdsBySource: async ({ sourceSlug }) => {
        return db
            .selectFrom("software_external_datas")
            .select("externalId")
            .where("sourceSlug", "=", sourceSlug)
            .execute()
            .then(rows => rows.map(row => row.externalId));
    },
    getBySource: async ({ sourceSlug }) => {
        return db
            .selectFrom("software_external_datas")
            .selectAll()
            .where("sourceSlug", "=", sourceSlug)
            .execute()
            .then(rows => rows.map(row => stripNullOrUndefinedValues(row)));
    }
});
