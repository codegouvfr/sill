import { Kysely } from "kysely";
import { SimilarSoftwareRepository } from "../../../ports/DbApiV2";
import { Database } from "./kysely.database";

export const createPgSimilarSoftwareRepository = (db: Kysely<Database>): SimilarSoftwareRepository => ({
    create: (
        similars: {
            softwareId: number;
            similarSoftwareId: number;
        }[]
    ) => {
        return db.transaction().execute(async trx => {
            await trx.insertInto("softwares__similar_software_external_datas").values(similars).execute();

            return Promise.resolve();
        });
    },
    getBySoftwareId: async (id: number) => {
        const result = await db
            .selectFrom("softwares__similar_software_external_datas")
            .selectAll()
            .where("softwareId", "=", id)
            .execute();
        return result.map(row => row.similarSoftwareId);
    }
});
