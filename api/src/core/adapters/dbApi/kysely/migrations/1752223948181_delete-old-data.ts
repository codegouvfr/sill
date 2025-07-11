// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import { type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable("compiled_softwares").execute();

    // Update with job:update after to load comptoirDuLibre data
    await db
        .insertInto("sources")
        .values({
            slug: "cnll",
            kind: "CNLL",
            url: "https://cnll.fr/",
            priority: 3,
            description: JSON.stringify({ fr: "Union des entreprises du logiciel libre et du numérique ouvert" })
        })
        .onConflict(oc => oc.column("slug").doNothing())
        .execute();

    // Ensure the trace of bind between tables
    const idsToWrite = await db
        .selectFrom("softwares as s")
        .leftJoin("software_external_datas as ext", "ext.externalId", "s.externalIdForSource")
        .select(["s.id", "s.sourceSlug", "s.externalIdForSource"])
        // Only select if you have data to insert
        .where("s.externalIdForSource", "is not", null)
        // When join is not already made
        .whereRef("ext.softwareId", "!=", "s.id")
        .where("s.dereferencing", "is", null)
        .execute();

    if (idsToWrite?.length > 0) {
        await Promise.all(
            idsToWrite.map(({ id, externalIdForSource, sourceSlug }) => {
                db.updateTable("software_external_datas")
                    .set({
                        sourceSlug,
                        externalId: externalIdForSource
                    })
                    .where("softwareId", "=", id)
                    .executeTakeFirst();
            })
        );
    }

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

    await db.schema
        .alterTable("softwares")
        .addColumn("sourceSlug", "text", col => col.references("sources.slug"))
        .addColumn("externalIdForSource", "text")
        .execute();
}
