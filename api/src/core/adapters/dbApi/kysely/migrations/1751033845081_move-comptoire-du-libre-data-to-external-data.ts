// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    const comptoirDuLibreSourceSlug = "comptoir-du-libre";
    await db
        .insertInto("sources")
        .values({
            kind: "ComptoirDuLibre",
            slug: comptoirDuLibreSourceSlug,
            description: JSON.stringify({ fr: "Comptoir du Libre" }),
            url: "https://comptoir-du-libre.org",
            priority: 2
        })
        .onConflict(oc => oc.column("slug").doNothing())
        .execute();

    const softsWithSourceComptoireDuLibre = await db
        .selectFrom("softwares")
        .select(["id", "comptoirDuLibreId", "name", "description"])
        .where("comptoirDuLibreId", "is not", null)
        .where("dereferencing", "is", null)
        .execute();

    if (softsWithSourceComptoireDuLibre.length > 0) {
        await db
            .insertInto("software_external_datas")
            .values(
                softsWithSourceComptoireDuLibre.map(s => ({
                    softwareId: s.id,
                    externalId: s.comptoirDuLibreId.toString(),
                    sourceSlug: comptoirDuLibreSourceSlug,
                    label: JSON.stringify(s.name),
                    description: JSON.stringify(s.description),
                    developers: JSON.stringify([])
                }))
            )
            .execute();
    }

    await db.schema.alterTable("softwares").dropColumn("comptoirDuLibreId").execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.alterTable("softwares").addColumn("comptoirDuLibreId", "integer").execute();
}
