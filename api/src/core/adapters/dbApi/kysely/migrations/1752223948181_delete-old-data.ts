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
            description: JSON.stringify({ fr: "Union des entreprises du logiciel libre et du numérique ouvert" })
        })
        .onConflict(oc => oc.column("slug").doNothing())
        .execute();
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
}
