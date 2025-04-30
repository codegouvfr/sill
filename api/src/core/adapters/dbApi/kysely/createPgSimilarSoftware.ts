// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import { Kysely } from "kysely";
import { SimilarSoftwareRepository } from "../../../ports/DbApiV2";
import { Database } from "./kysely.database";

export const createPgSimilarSoftwareRepository = (db: Kysely<Database>): SimilarSoftwareRepository => ({
    insert: async params => {
        const dataToInsert = params
            .map(({ softwareId, externalIds }) => {
                return externalIds.map(({ externalId, sourceSlug }) => ({
                    similarExternalId: externalId,
                    sourceSlug,
                    softwareId
                }));
            })
            .flat();

        await db.insertInto("softwares__similar_software_external_datas").values(dataToInsert).execute();
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
    },
    getByExternalId: async ({ externalId, sourceSlug }) => {
        return db
            .selectFrom("softwares__similar_software_external_datas")
            .select("softwareId")
            .where("similarExternalId", "=", externalId)
            .where("sourceSlug", "=", sourceSlug)
            .execute();
    }
});
