import type { Kysely } from "kysely";

const softwares_externalIdIdx = "softwares__externalId_idx";
const softwares_parentExternalIdIdx = "softwares__parentExternalId_idx";
const compiledSoftwares_SoftwareIdIdx = "compiled_softwares__softwareId_idx";
const software_similarExternalIdIdx = "softwares_similarExternalId_idx";
const software_softwareIdIdx = "softwares_similarSoftwareId_idx";
const softwareReferents_softwareIdIdx = "softwareReferents_software_idx";
const softwareUsers_softwareIdIdx = "softwareUsers_software_idx";
const instances_mainSoftwareSillIdIdx = "instances_mainSoftwareSillId_idx";

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema.createIndex(softwares_externalIdIdx).on("softwares").column("externalId").execute();
    await db.schema
        .createIndex(softwares_parentExternalIdIdx)
        .on("softwares")
        .column("parentSoftwareWikidataId")
        .execute();

    await db.schema
        .createIndex(software_similarExternalIdIdx)
        .on("softwares__similar_software_external_datas")
        .column("similarExternalId")
        .execute();
    await db.schema
        .createIndex(software_softwareIdIdx)
        .on("softwares__similar_software_external_datas")
        .column("softwareId")
        .execute();

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
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropIndex(softwares_parentExternalIdIdx).execute();
    await db.schema.dropIndex(softwares_externalIdIdx).execute();
    await db.schema.dropIndex(software_similarExternalIdIdx).execute();
    await db.schema.dropIndex(software_softwareIdIdx).execute();
    await db.schema.dropIndex(compiledSoftwares_SoftwareIdIdx).execute();
    await db.schema.dropIndex(softwareReferents_softwareIdIdx).execute();
    await db.schema.dropIndex(softwareUsers_softwareIdIdx).execute();
    await db.schema.dropIndex(instances_mainSoftwareSillIdIdx).execute();
}
