import type { Kysely } from "kysely";

const compiledSoftwares_SoftwareIdIdx = "compiled_softwares__softwareId_idx";
const compiledSoftwares_GroupByIdx = "compiled_softwares_group_by_idx";
const softwareReferents_softwareIdIdx = "softwareReferents_software_idx";
const softwareUsers_softwareIdIdx = "softwareUsers_software_idx";
const instances_mainSoftwareSillIdIdx = "instances_mainSoftwareSillId_idx";

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createIndex(compiledSoftwares_SoftwareIdIdx)
        .on("compiled_softwares")
        .column("softwareId")
        .execute();

    await db.schema
        .createIndex(softwareReferents_softwareIdIdx)
        .on("software_referents")
        .column("softwareId")
        .execute();

    await db.schema.createIndex(softwareUsers_softwareIdIdx).on("software_users").column("softwareId").execute();
    await db.schema.createIndex(instances_mainSoftwareSillIdIdx).on("instances").column("mainSoftwareSillId").execute();

    // CREATE INDEX idx_compiled_softwares_group_by ON compiled_softwares (softwareId, annuaireCnllServiceProviders, comptoirDuLibreSoftware, latestVersion, parentWikidataSoftware, serviceProviders, similarExternalSoftwares, softwareExternalData);
    await db.schema
        .createIndex(compiledSoftwares_GroupByIdx)
        .on("compiled_softwares")
        .column("softwareId")
        .column("annuaireCnllServiceProviders")
        .column("comptoirDuLibreSoftware")
        .column("latestVersion")
        .column("parentWikidataSoftware")
        .column("serviceProviders")
        .column("similarExternalSoftwares")
        .column("softwareExternalData")
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropIndex(compiledSoftwares_SoftwareIdIdx).execute();
    await db.schema.dropIndex(softwareReferents_softwareIdIdx).execute();
    await db.schema.dropIndex(softwareUsers_softwareIdIdx).execute();
    await db.schema.dropIndex(instances_mainSoftwareSillIdIdx).execute();
    await db.schema.dropIndex(compiledSoftwares_GroupByIdx).execute();
}
