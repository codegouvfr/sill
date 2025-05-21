import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable("sources")
        .alterColumn("kind", col => col.setDataType("text"))
        .execute();

    await db.schema.dropType("external_data_origin_type").execute();
    await db.schema
        .createType("external_data_origin_type")
        .asEnum(["wikidata", "HAL", "ComptoirDuLibre", "CNLL"])
        .execute();

    await db.schema
        .alterTable("sources")
        .alterColumn("kind", col =>
            col.setDataType(sql`external_data_origin_type USING kind::external_data_origin_type`)
        )
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
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
}
