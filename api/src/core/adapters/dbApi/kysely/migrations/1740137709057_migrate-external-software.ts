import { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    // Introducing the notion of beeing referenced inside the catalog for software using a boolean
    await db.schema
        .alterTable("softwares")
        .addColumn("isReferenced", "boolean")
        .alterColumn("referencedSinceTime", c => c.dropNotNull())
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable("softwares")
        .dropColumn("isReferenced")
        .alterColumn("referencedSinceTime", c => c.setNotNull())
        .execute();
}
