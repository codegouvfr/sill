import type { Kysely } from "kysely";
import { Database } from "../kysely.database";

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<Database>): Promise<void> {
    const comptoirDuLibreSourceSlug = "comptoir-du-libre";
    await db
        .insertInto("sources")
        .values({
            kind: "ComptoirDuLibre",
            slug: comptoirDuLibreSourceSlug,
            description: JSON.stringify({ fr: "Comptoir du Libre" }),
            url: "https://comptoir-du-libre.org",
            priority: 2
        })
        .onConflict(oc => oc.column("slug").doNothing())
        .execute();

    const softsWithSourceComptoireDuLibre = await db
        .selectFrom("softwares")
        .select(["id", "comptoirDuLibreId", "name", "description"])
        .where("comptoirDuLibreId", "is not", null)
        .execute();

    if (softsWithSourceComptoireDuLibre.length > 0) {
        await db
            .insertInto("software_external_datas")
            .values(
                softsWithSourceComptoireDuLibre.map(s => ({
                    softwareId: s.id,
                    externalId: s.comptoirDuLibreId!.toString(),
                    sourceSlug: comptoirDuLibreSourceSlug,
                    label: JSON.stringify(s.name),
                    description: JSON.stringify(s.description),
                    developers: JSON.stringify([])
                }))
            )
            .execute();
    }
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(): Promise<void> {
    // we don't care
}
