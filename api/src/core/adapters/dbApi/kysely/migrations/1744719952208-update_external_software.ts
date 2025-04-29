// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable("software_external_datas")
        .alterColumn("isLibreSoftware", col => col.dropNotNull())
        .addColumn("lastDataFetchAt", "bigint")
        .execute();

    await db.schema.alterTable("softwares").dropColumn("lastExtraDataFetchAt").execute();

    // Change PK on software_external_datas
    await db.schema.alterTable("software_external_datas").dropConstraint("software_external_datas_pkey").execute();

    await db.schema
        .alterTable("software_external_datas")
        .addPrimaryKeyConstraint("software_external_datas_pkey", ["externalId", "sourceSlug"])
        .execute();

    // Add on delete cascade
    await db.schema
        .alterTable("software_external_datas")
        .dropConstraint("software_external_datas_softwareId_fkey")
        .execute();
    await db.schema
        .alterTable("software_external_datas")
        .dropConstraint("software_external_datas_sourceSlug_fkey")
        .execute();

    await db.schema
        .alterTable("software_external_datas")
        .addForeignKeyConstraint(
            "software_external_datas_softwareId_fkey",
            ["softwareId"],
            "softwares",
            ["id"],
            constraint => constraint.onDelete("cascade")
        )
        .execute();

    await db.schema
        .alterTable("software_external_datas")
        .addForeignKeyConstraint(
            "software_external_datas_sourceSlug_fkey",
            ["sourceSlug"],
            "sources",
            ["slug"],
            constraint => constraint.onDelete("cascade")
        )
        .execute();

    // Add on delete cascade between similarSoftware and externalData
    await db.schema
        .alterTable("softwares__similar_software_external_datas")
        .dropConstraint("softwares__similar_software_external_datas_sourceSlug_fkey")
        .execute();

    await db.schema
        .alterTable("softwares__similar_software_external_datas")
        .addForeignKeyConstraint(
            "softwares__similar_software_external_datas_software_external_datas_fkey",
            ["similarExternalId", "sourceSlug"],
            "software_external_datas",
            ["externalId", "sourceSlug"],
            constraint => constraint.onDelete("cascade")
        )
        .execute();

    // Change PK on softwares__similar_software_external_datas
    await db.schema
        .alterTable("softwares__similar_software_external_datas")
        .dropConstraint("uniq_software_id__similar_software_external_id")
        .execute();

    await db.schema
        .alterTable("softwares__similar_software_external_datas")
        .addPrimaryKeyConstraint("softwares__similar_software_external_datas_pkey", [
            "softwareId",
            "similarExternalId",
            "sourceSlug"
        ])
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable("software_external_datas")
        .alterColumn("isLibreSoftware", col => col.setNotNull())
        .dropColumn("lastDataFetchAt")
        .execute();

    await db.schema.alterTable("softwares").addColumn("lastExtraDataFetchAt", "timestamptz").execute();

    await db.schema.alterTable("software_external_datas").dropConstraint("software_external_datas_pkey").execute();

    await db.schema
        .alterTable("software_external_datas")
        .addPrimaryKeyConstraint("software_external_datas_pkey", ["externalId"])
        .execute();

    // Remove on delete cascade
    await db.schema
        .alterTable("software_external_datas")
        .dropConstraint("software_external_datas_softwareId_fkey")
        .execute();
    await db.schema
        .alterTable("software_external_datas")
        .dropConstraint("software_external_datas_sourceSlug_fkey")
        .execute();

    await db.schema
        .alterTable("software_external_datas")
        .addForeignKeyConstraint("software_external_datas_softwareId_fkey", ["softwareId"], "softwares", ["id"])
        .execute();

    await db.schema
        .alterTable("software_external_datas")
        .addForeignKeyConstraint("software_external_datas_sourceSlug_fkey", ["sourceSlug"], "sources", ["slug"])
        .execute();

    // Revert to a single forein key without cascade
    await db.schema
        .alterTable("softwares__similar_software_external_datas")
        .dropConstraint("softwares__similar_software_external_datas_software_external_datas_fkey")
        .execute();

    await db.schema
        .alterTable("softwares__similar_software_external_datas")
        .addForeignKeyConstraint(
            "softwares__similar_software_external_datas_sourceSlug_fkey",
            ["sourceSlug"],
            "sources",
            ["slug"]
        )
        .execute();

    // Revet PK to unique on softwares__similar_software_external_datas
    await db.schema
        .alterTable("softwares__similar_software_external_datas")
        .dropConstraint("softwares__similar_software_external_datas_pkey")
        .execute();

    await db.schema
        .alterTable("softwares__similar_software_external_datas")
        .addPrimaryKeyConstraint("uniq_software_id__similar_software_external_id", ["softwareId", "similarExternalId"])
        .execute();
}
