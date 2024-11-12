import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("softwares")
    .alterColumn("addedByAgentId", (ac) => ac.dropNotNull())
    .execute();
  await db.schema.alterTable("softwares").alterColumn("addedByAgentId", (ac) => ac.dropNotNull()).execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("softwares")
    .alterColumn("addedByAgentId", (ac) => ac.setNotNull())
    .execute();
}