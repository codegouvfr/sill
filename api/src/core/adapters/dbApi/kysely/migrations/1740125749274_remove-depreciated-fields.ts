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
