// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import { Kysely } from "kysely";
import { OtherSoftwareExtraDataRepository } from "../../../ports/DbApiV2";
import { Database } from "./kysely.database";

export const createPgOtherSoftwareExtraDataRepository = (db: Kysely<Database>): OtherSoftwareExtraDataRepository => ({
    save: async ({
        softwareId,
        annuaireCnllServiceProviders,
        serviceProviders,
        comptoirDuLibreSoftware,
        latestVersion
    }) => {
        const pgValues = {
            softwareId,
            annuaireCnllServiceProviders: JSON.stringify(annuaireCnllServiceProviders),
            serviceProviders: JSON.stringify(serviceProviders),
            comptoirDuLibreSoftware: JSON.stringify(comptoirDuLibreSoftware),
            latestVersion: JSON.stringify(latestVersion)
        };

        await db
            .insertInto("compiled_softwares")
            .values(pgValues)
            .onConflict(oc => oc.column("softwareId").doUpdateSet(pgValues))
            .executeTakeFirst();
    },
    getBySoftwareId: async softwareId =>
        db.selectFrom("compiled_softwares").selectAll().where("softwareId", "=", softwareId).executeTakeFirst()
});

// const a = qb => ({
//     annuaireCnllServiceProviders: qb.ref("excluded.annuaireCnllServiceProviders"),
//     serviceProviders: qb.ref("excluded.serviceProviders"),
//     comptoirDuLibreSoftware: qb.ref("excluded.comptoirDuLibreSoftware"),
//     latestVersion: qb.ref("excluded.latestVersion")
// });
