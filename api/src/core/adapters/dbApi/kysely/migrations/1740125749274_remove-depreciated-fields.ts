// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema.alterTable("softwares").dropColumn("catalogNumeriqueGouvFrId").dropColumn("testUrls").execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable("softwares")
        .addColumn("testUrls", "jsonb")
        .addColumn("catalogNumeriqueGouvFrId", "text")
        .execute();
}
