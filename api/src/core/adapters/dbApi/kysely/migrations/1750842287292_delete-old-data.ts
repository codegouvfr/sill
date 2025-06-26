import { type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable("compiled_softwares").execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    const compiledSoftwares_SoftwareIdIdx = "compiled_softwares__softwareId_idx";

    await db.schema
        .createTable("compiled_softwares")
        .addColumn("softwareId", "integer", col =>
            col.notNull().primaryKey().references("softwares.id").onDelete("cascade")
        )
        .addColumn("serviceProviders", "jsonb", col => col.notNull())
        .addColumn("comptoirDuLibreSoftware", "jsonb")
        .addColumn("annuaireCnllServiceProviders", "jsonb")
        .addColumn("latestVersion", "jsonb")
        .execute();

    await db.schema
        .createIndex(compiledSoftwares_SoftwareIdIdx)
        .on("compiled_softwares")
        .column("softwareId")
        .execute();
}
