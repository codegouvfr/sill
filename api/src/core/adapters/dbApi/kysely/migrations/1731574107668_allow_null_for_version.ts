import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("softwares")
    .alterColumn("versionMin", (ac) => ac.dropNotNull())
    .execute();
  
  await db.schema.alterTable("software_external_datas")
    .addColumn("softwareVersion", "text")
    .addColumn("keywords", "text")
    .addColumn("programmingLanguage", "text")
    .addColumn("applicationCategory", "text")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("softwares")
    .alterColumn("versionMin", (ac) => ac.setNotNull())
    .execute();
  
  await db.schema.alterTable("software_external_datas")
    .dropColumn("softwareVersion")
    .dropColumn("keywords")
    .dropColumn("programmingLanguage")
    .dropColumn("applicationCategory")
    .execute();
}