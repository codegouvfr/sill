import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    // Introducing the notion of beeing referenced inside the catalog for software using a boolean
    await db.schema
        .alterTable("softwares")
        .alterColumn("referencedSinceTime", c => c.dropNotNull())
        .execute();

    // Importing not referenced software
    // SELECT * FROM software_external_datas WHERE software_external_datas.externalId NOT IN (SELECT externalId FROM softwares)
    const externalSoftwares = await db
        .selectFrom("software_external_datas")
        .selectAll()
        .where(
            "software_external_datas.externalId",
            "not in",
            db.selectFrom("softwares").select("softwares.externalId")
        )
        .execute();

    await db.schema
        .alterTable("softwares__similar_software_external_datas")
        .addColumn("similarSoftwareId", "serial", col => col.references("softwares.id").onDelete("cascade"))
        .execute();

    // Add the composite primary key
    await db.schema
        .alterTable("softwares__similar_software_external_datas")
        .addPrimaryKeyConstraint("softwares__similar_software_external_datas_pkey", ["similarSoftwareId", "softwareId"])
        .execute();

    if (externalSoftwares && externalSoftwares.length > 0) {
        await db
            .insertInto("softwares")
            .values(
                externalSoftwares.map(externalSoftwareItem => {
                    return {
                        softwareType: {},
                        externalId: externalSoftwareItem.externalId,
                        externalDataOrigin: externalSoftwareItem.externalDataOrigin,
                        name: externalSoftwareItem.label?.fr ?? externalSoftwareItem.label?.en, // Localized text
                        description: externalSoftwareItem.description?.fr ?? externalSoftwareItem.label?.en, // Localized text
                        license: externalSoftwareItem.licence,
                        isPresentInSupportContract: false,
                        isFromFrenchPublicService: false,
                        logoUrl: externalSoftwareItem.logoUrl,
                        keywords: externalSoftwareItem?.keywords ?? [],
                        isStillInObservation: false,
                        workshopUrls: [],
                        categories: externalSoftwareItem?.applicationCategories ?? [],
                        addedByAgentId: 1,
                        isReferenced: false
                    };
                })
            )
            .execute();

        // Update softwares__similar_software_external_datas
        await db
            .updateTable("softwares__similar_software_external_datas")
            .set({
                similarSoftwareId: sql`softwares.id`
            })
            .from("softwares")
            .where("softwares__similar_software_external_datas.similarExternalId", "=", "softwares.externalId")
            .execute();
    }

    await db.schema.alterTable("softwares__similar_software_external_datas").dropColumn("similarExternalId").execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable("softwares__similar_software_external_datas")
        .addColumn("similarExternalId", "text", col => col.notNull())
        .execute();

    await db
        .updateTable("softwares__similar_software_external_datas")
        .set({
            similarExternalId: db
                .selectFrom("softwares")
                .select("softwares.externalId")
                .whereRef("softwares.id", "=", "softwares__similar_software_external_datas.similarSoftwareId")
        })
        .execute();

    await db.schema.alterTable("softwares__similar_software_external_datas").dropColumn("similarSoftwareId").execute();

    await db.schema
        .alterTable("softwares__similar_software_external_datas")
        .dropConstraint("softwares__similar_software_external_datas_pkey")
        .execute();

    await db.deleteFrom("softwares").where("referencedSinceTime.", "is", null).execute();

    await db.schema
        .alterTable("softwares")
        .alterColumn("referencedSinceTime", c => c.setNotNull())
        .execute();
}
