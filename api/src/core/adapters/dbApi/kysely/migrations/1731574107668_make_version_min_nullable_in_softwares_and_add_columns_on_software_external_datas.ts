import { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable("softwares")
        .alterColumn("versionMin", ac => ac.dropNotNull())
        .execute();

    await db.schema
        .alterTable("software_external_datas")
        .addColumn("softwareVersion", "text")
        .addColumn("publicationTime", "timestamptz")
        .addColumn("keywords", "jsonb")
        .addColumn("programmingLanguages", "jsonb")
        .addColumn("applicationCategories", "jsonb")
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable("softwares")
        .alterColumn("versionMin", ac => ac.setNotNull())
        .execute();

    await db.schema
        .alterTable("software_external_datas")
        .dropColumn("softwareVersion")
        .dropColumn("publicationTime")
        .dropColumn("keywords")
        .dropColumn("programmingLanguages")
        .dropColumn("applicationCategories")
        .execute();
}
