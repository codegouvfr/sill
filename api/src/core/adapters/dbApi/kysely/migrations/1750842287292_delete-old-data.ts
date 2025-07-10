// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import { type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable("compiled_softwares").execute();

    // ComptoirDuLibre
    const comptoirSlug = "comptoirdulibre";
    const secondSource = {
        slug: comptoirSlug,
        kind: "ComptoirDuLibre",
        url: "https://comptoir-du-libre.org/",
        priority: 2
    };
    await db.insertInto("sources").values(secondSource).executeTakeFirst();

    const comptoirIds = await db
        .selectFrom("softwares")
        .select(["id", "comptoirDuLibreId"])
        .where("comptoirDuLibreId", "is not", null)
        .execute();

    if (comptoirIds?.length > 0) {
        await db
            .insertInto("software_external_datas")
            .values(
                comptoirIds.map(({ comptoirDuLibreId, id = null }) => ({
                    externalId: comptoirDuLibreId,
                    sourceSlug: comptoirSlug,
                    softwareId: id,
                    developers: JSON.stringify([]),
                    label: JSON.stringify({}),
                    description: JSON.stringify({})
                }))
            )
            .onConflict(oc => oc.columns(["sourceSlug", "externalId"]).doNothing())
            .executeTakeFirst();
    }

    await db.schema.alterTable("softwares").dropColumn("comptoirDuLibreId").execute();

    // Update with job:update after to load comptoirDuLibre data

    const thirdSource = {
        slug: comptoirSlug,
        kind: "CNLL",
        url: "https://cnll.fr/",
        priority: 3
    };
    await db.insertInto("sources").values(thirdSource).executeTakeFirst();

    // Rewrite stuff

    // Delete
    await db.schema.alterTable("softwares").dropColumn("externalIdForSource").dropColumn("sourceSlug").execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    const compiledSoftwares_SoftwareIdIdx = "compiled_softwares__softwareId_idx";

    await db.schema
        .createTable("compiled_softwares")
        .addColumn("softwareId", "integer", col =>
            col.notNull().primaryKey().references("softwares.id").onDelete("cascade")
        )
        .addColumn("serviceProviders", "jsonb", col => col.notNull())
        .addColumn("comptoirDuLibreSoftware", "jsonb")
        .addColumn("annuaireCnllServiceProviders", "jsonb")
        .addColumn("latestVersion", "jsonb")
        .execute();

    await db.schema
        .createIndex(compiledSoftwares_SoftwareIdIdx)
        .on("compiled_softwares")
        .column("softwareId")
        .execute();

    // comptoirDuLibreId
    await db.schema.alterTable("softwares").addColumn("comptoirDuLibreId", "integer").execute();
}
