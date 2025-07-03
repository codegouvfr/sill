import { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    // Merging data
    // The data on software_external_datas will update themselves on the next update

    await db.schema.alterTable("software_external_datas").dropColumn("framaLibreId").execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.alterTable("software_external_datas").addColumn("framaLibreId", "text").execute();
}
