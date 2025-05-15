import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable("sources")
        .alterColumn("kind", col => col.setDataType("text"))
        .execute();

    await db.schema.dropType("external_data_origin_type").execute();
    await db.schema.createType("external_data_origin_type").asEnum(["wikidata", "HAL", "ComptoirDuLibre"]).execute();

    await db.schema
        .alterTable("sources")
        .alterColumn("kind", col =>
            col.setDataType(sql`external_data_origin_type USING kind::external_data_origin_type`)
        )
        .execute();

    const compiledSoftwarePackages = await db
        .selectFrom("compiled_softwares")
        .select(["comptoirDuLibreSoftware", "softwareId"])
        .execute();

    if (compiledSoftwarePackages && compiledSoftwarePackages.length > 0) {
        // Create Comptoir Du Libre
        const cDLSource = {
            slug: "comptoirDuLibre",
            kind: "ComptoirDuLibre",
            url: "https://comptoir-du-libre.org/",
            priority: 2
        };
        await db.insertInto("sources").values(cDLSource).executeTakeFirst();

        const externalDataIds = compiledSoftwarePackages.map(row => ({
            externalId: row.comptoirDuLibreSoftware.id,
            sourceSlug: cDLSource.slug,
            softwareId: row.softwareId,
            developers: JSON.stringify([]),
            label: JSON.stringify({}),
            description: JSON.stringify({})
        }));

        await db.insertInto("software_external_datas").values(externalDataIds).execute();
    }

    // Delete row
    await db.schema.alterTable("compiled_softwares").dropColumn("comptoirDuLibreSoftware").execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable("sources")
        .alterColumn("kind", col => col.setDataType("text"))
        .execute();

    await db.schema.dropType("external_data_origin_type").execute();
    await db.schema.createType("external_data_origin_type").asEnum(["wikidata", "HAL"]).execute();

    await db.schema
        .alterTable("sources")
        .alterColumn("kind", col =>
            col.setDataType(sql`external_data_origin_type USING kind::external_data_origin_type`)
        )
        .execute();
}
