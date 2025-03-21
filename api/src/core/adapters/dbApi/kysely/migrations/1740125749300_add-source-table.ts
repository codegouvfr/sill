import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable("sources")
        .addColumn("slug", "text", col => col.primaryKey())
        .addColumn("kind", sql`external_data_origin_type`, col => col.notNull())
        .addColumn("url", "text", col => col.notNull())
        .addColumn("priority", "integer", col => col.unique().notNull())
        .addColumn("description", "jsonb")
        .execute();

    await db.schema
        .alterTable("software_external_datas")
        .addColumn("sourceSlug", "text", col => col.references("sources.slug"))
        .addColumn("softwareId", "integer", col => col.references("softwares.id"))
        .execute();

    // Insert the source used until now in the table
    const firstExistingSoftware = await db
        .selectFrom("softwares")
        .select("externalDataOrigin")
        .limit(1)
        .executeTakeFirst();

    if (firstExistingSoftware?.externalDataOrigin === "HAL") {
        await db
            .insertInto("sources")
            .values({
                slug: "hal",
                kind: "HAL",
                url: "https://hal.science",
                priority: 1
            })
            .executeTakeFirst();

        await db.updateTable("software_external_datas").set({ sourceSlug: "hal" }).execute();
    }

    if (firstExistingSoftware?.externalDataOrigin === "wikidata" || !firstExistingSoftware) {
        // this will be the default source, if there was no existing software
        await db
            .insertInto("sources")
            .values({
                slug: "wikidata",
                kind: "wikidata",
                url: "https://www.wikidata.org",
                priority: 1
            })
            .executeTakeFirst();

        await db.updateTable("software_external_datas").set({ sourceSlug: "wikidata" }).execute();
    }

    // add unique contraint on sourceSlug + externalId  softwareId
    await db.schema
        .alterTable("software_external_datas")
        .addUniqueConstraint("uniq_source_external_id", ["sourceSlug", "externalId", "softwareId"])
        .execute();

    await db
        .updateTable("software_external_datas")
        .set(eb => ({
            softwareId: eb
                .selectFrom("softwares")
                .select("id")
                .whereRef("softwares.externalId", "=", "software_external_datas.externalId")
                .limit(1)
        }))
        .execute();

    await db.schema
        .alterTable("software_external_datas")
        .alterColumn("sourceSlug", col => col.setNotNull())
        .dropColumn("externalDataOrigin")
        .execute();
    await db.schema.alterTable("softwares").dropColumn("externalDataOrigin").dropColumn("externalId").execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable("softwares")
        .addColumn("externalDataOrigin", sql`external_data_origin_type`)
        .addColumn("externalId", "text")
        .execute();

    await db.schema
        .alterTable("software_external_datas")
        .addColumn("externalDataOrigin", sql`external_data_origin_type`)
        .execute();

    // 2. Migrate the data while sources table still exists
    await db
        .updateTable("software_external_datas")
        .set(eb => ({
            externalDataOrigin: eb
                .selectFrom("sources")
                .select("kind")
                .whereRef("sources.slug", "=", "software_external_datas.sourceSlug")
        }))
        .execute();

    await db
        .updateTable("softwares")
        .set(eb => ({
            externalId: eb
                .selectFrom("software_external_datas")
                .select("externalId")
                .whereRef("software_external_datas.softwareId", "=", "softwares.id")
                .limit(1),
            externalDataOrigin: eb
                .selectFrom("software_external_datas")
                .select("externalDataOrigin")
                .whereRef("software_external_datas.softwareId", "=", "softwares.id")
                .limit(1)
        }))
        .execute();

    // 3. Make externalDataOrigin NOT NULL since it's required
    await db.schema
        .alterTable("software_external_datas")
        .alterColumn("externalDataOrigin", ac => ac.setNotNull())
        .execute();

    // 4. Only after data is migrated, drop the new columns
    await db.schema.alterTable("software_external_datas").dropColumn("softwareId").dropColumn("sourceSlug").execute();

    // 5. Finally drop the sources table
    await db.schema.dropTable("sources").execute();
}
