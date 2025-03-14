import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    // Create Data Origin
    await db.schema
        .createTable("sources")
        .addColumn("slug", "text", col => col.primaryKey())
        .addColumn("kind", sql`external_data_origin_type`, col => col.notNull())
        .addColumn("url", "text", col => col.notNull())
        .addColumn("priority", "integer", col => col.unique().notNull())
        .addColumn("description", "jsonb")
        .execute();

    // Add new references
    await db.schema
        .alterTable("software_external_datas")
        .addColumn("softwareId", "serial", col => col.notNull().references("softwares.id"))
        .addColumn("sourceId", "text", col => col.primaryKey().notNull().references("sources.slug"))
        .execute();

    // Insert the source
    const result = await db.selectFrom("softwares").select("externalDataOrigin").executeTakeFirst();
    if (result?.externalDataOrigin === "HAL") {
        db.insertInto("sources")
            .values({
                slug: "hal",
                kind: "HAL",
                url: "https://hal.science",
                priority: 1
            })
            .executeTakeFirst();
        db.updateTable("software_external_datas")
            .set({
                sourceId: "hal"
            })
            .execute();
    }
    if (result?.externalDataOrigin === "wikidata") {
        db.insertInto("sources")
            .values({
                slug: "wikidata",
                kind: "wikidata",
                url: "https://www.wikidata.org",
                priority: 1
            })
            .executeTakeFirst();
        db.updateTable("software_external_datas")
            .set({
                sourceId: "wikidata"
            })
            .execute();
    }

    // UPDATE software_external_datas
    // SET "softwareId" = softwares.id
    // FROM softwares
    // WHERE software_external_datas."externalId" = softwares."externalId";
    await db
        .updateTable("software_external_datas")
        .set({
            softwareId: sql`softwares.id`
        })
        .from("softwares")
        .where("software_external_datas.externalId", "=", "softwares.externalId")
        .execute();

    // Remove old fields
    /*  await db.schema.alterTable("software_external_datas")
         .dropColumn("externalDataOrigin")
         .execute();
 
     await db.schema.alterTable("softwares")
         .dropColumn("externalDataOrigin")
         .dropColumn("externalId")
         .execute(); */

    // Update type
    // await db.schema.createType("external_data_origin_type").asEnum(["wikidata", "HAL"]).execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.alterTable("software_external_datas").dropColumn("softwareId").execute();

    // await db.schema.dropTable("sources").execute();
}
