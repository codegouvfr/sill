import { Kysely } from "kysely";
import { SimilarSoftwareRepository } from "../../../ports/DbApiV2";
import { Database } from "./kysely.database";

export const createPgSimilarSoftwareRepository = (db: Kysely<Database>): SimilarSoftwareRepository => ({
    insert: async params => {
        const { softwareId, externalIds } = params;

        if (externalIds.length > 0) {
            await db
                .insertInto("softwares__similar_software_external_datas")
                .values(
                    externalIds.map(({ externalId, sourceSlug }) => ({
                        similarExternalId: externalId,
                        sourceSlug,
                        softwareId
                    }))
                )
                .execute();
        }
    },
    getById: async params => {
        const { softwareId } = params;

        const siumilarIds = await db
            .selectFrom("softwares__similar_software_external_datas")
            .selectAll()
            .where("softwareId", "=", softwareId)
            .execute();

        return siumilarIds.map(silimarRow => ({
            externalId: silimarRow.similarExternalId,
            sourceSlug: silimarRow.sourceSlug
        }));
    }
});
