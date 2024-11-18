import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("softwares")
    .alterColumn("versionMin", (ac) => ac.dropNotNull())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("softwares")
    .alterColumn("versionMin", (ac) => ac.setNotNull())
    .execute();
}