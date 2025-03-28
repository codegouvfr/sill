import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable("agents")
        .alterColumn("organization", ac => ac.dropNotNull())
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable("agents")
        .alterColumn("organization", ac => ac.setNotNull())
        .execute();
}
