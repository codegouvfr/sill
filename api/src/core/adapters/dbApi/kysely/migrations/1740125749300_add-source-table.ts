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

    const mainSource =
        firstExistingSoftware?.externalDataOrigin === "HAL"
            ? {
                  slug: "hal",
                  kind: "HAL",
                  url: "https://hal.science",
                  priority: 1
              }
            : {
                  slug: "wikidata",
                  kind: "wikidata",
                  url: "https://www.wikidata.org",
                  priority: 1
              };

    await db.insertInto("sources").values(mainSource).executeTakeFirst();
    await db.updateTable("software_external_datas").set({ sourceSlug: mainSource.slug }).execute();

    // add unique contraint on sourceSlug + externalId + softwareId
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

    await db.schema
        .alterTable("softwares")
        .addColumn("sourceSlug", "text", col => col.references("sources.slug"))
        .execute();

    await db
        .updateTable("softwares")
        .set({ sourceSlug: mainSource.slug })
        .where("externalDataOrigin", "=", mainSource.kind)
        .execute();

    await db.schema.alterTable("softwares").dropColumn("externalDataOrigin").execute();

    await db.schema.alterTable("softwares").renameColumn("externalId", "externalIdForSource").execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    const sources = await db.selectFrom("sources").selectAll().execute();

    await db.schema.alterTable("software_external_datas").dropConstraint("uniq_source_external_id").execute();

    await db.schema.alterTable("software_external_datas").addColumn("externalDataOrigin", "text").execute();

    for (const source of sources) {
        await db
            .updateTable("software_external_datas")
            .set({ externalDataOrigin: source.kind })
            .where("sourceSlug", "=", source.slug)
            .execute();
    }

    await db.schema.alterTable("software_external_datas").dropColumn("sourceSlug").dropColumn("softwareId").execute();

    await db.schema.alterTable("softwares").addColumn("externalDataOrigin", "text").execute();

    for (const source of sources) {
        await db
            .updateTable("softwares")
            .set({ externalDataOrigin: source.kind })
            .where("sourceSlug", "=", source.slug)
            .execute();
    }

    await db.schema.alterTable("softwares").renameColumn("externalIdForSource", "externalId").execute();

    await db.schema.alterTable("softwares").dropColumn("sourceSlug").execute();

    await db.schema.dropTable("sources").execute();
}
