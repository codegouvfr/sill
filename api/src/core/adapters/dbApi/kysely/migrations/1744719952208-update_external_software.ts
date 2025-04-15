import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable("software_external_datas")
        .alterColumn("isLibreSoftware", col => col.dropNotNull())
        .addColumn("lastDataFetchAt", "bigint")
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable("software_external_datas")
        .alterColumn("isLibreSoftware", col => col.setNotNull())
        .dropColumn("lastDataFetchAt")
        .execute();
}
