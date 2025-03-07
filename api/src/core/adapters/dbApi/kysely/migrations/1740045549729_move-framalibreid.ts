import { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    // Merging data
    // The data on software_external_datas will update themselves on the next update
    /* await db.updateTable('software_external_datas')
    .set({
      identifiers: sql`
        COALESCE(
          "identifiers",
          '[]'::jsonb
        ) || jsonb_build_object(
          'url', "framaLibreId",
          '@type', 'PropertyValue',
          'value', "framaLibreId",
          'subjectOf', jsonb_build_object(
            'url', 'https://framalibre.org',
            'name', 'FramaLibre Official instance',
            '@type', 'Website',
            'additionalType', 'FramaLibre'
          )
        )::jsonb
    `,
    })
    .execute(); */

    await db.schema.alterTable("software_external_datas").dropColumn("framaLibreId").execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.alterTable("software_external_datas").addColumn("framaLibreId", "text").execute();

    // The data on software_external_datas will update themselves on the next update
}
