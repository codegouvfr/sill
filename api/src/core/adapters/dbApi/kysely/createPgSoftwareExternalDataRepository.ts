import { Kysely } from "kysely";
import { SoftwareExternalDataRepository } from "../../../ports/DbApiV2";
import { Database } from "./kysely.database";

export const createPgSoftwareExternalDataRepository = (db: Kysely<Database>): SoftwareExternalDataRepository => ({
    save: async softwareExternalData => {
        const pgValues = {
            ...softwareExternalData,
            developers: JSON.stringify(softwareExternalData.developers),
            label: JSON.stringify(softwareExternalData.label),
            description: JSON.stringify(softwareExternalData.description)
        };

        await db
            .insertInto("software_external_datas")
            .values(pgValues)
            .onConflict(oc => oc.column("externalId").doUpdateSet(pgValues))
            .executeTakeFirst();
    }
});
