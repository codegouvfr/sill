// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import { Kysely } from "kysely";
import { SoftwareExternalDataRepository } from "../../../ports/DbApiV2";
import { Database } from "./kysely.database";

export const createPgSoftwareExternalDataRepository = (db: Kysely<Database>): SoftwareExternalDataRepository => ({
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
    }
});
