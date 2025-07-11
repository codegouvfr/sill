// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema.alterTable("software_external_datas").addColumn("providers", "jsonb").execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.alterTable("software_external_datas").dropColumn("providers").execute();
}
