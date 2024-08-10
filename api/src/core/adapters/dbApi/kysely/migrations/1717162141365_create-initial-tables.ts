import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema.createType("external_data_origin_type").asEnum(["wikidata", "HAL"]).execute();
    await db.schema
        .createTable("agents")
        .addColumn("id", "serial", col => col.primaryKey())
        .addColumn("email", "text", col => col.notNull())
        .addColumn("organization", "text", col => col.notNull())
        .addColumn("about", "text")
        .addColumn("isPublic", "boolean", col => col.notNull())
        .execute();

    await db.schema
        .createTable("softwares")
        // from form
        .addColumn("id", "serial", col => col.primaryKey())
        .addColumn("softwareType", "jsonb", col => col.notNull())
        .addColumn("externalId", "text")
        .addColumn("externalDataOrigin", sql`external_data_origin_type`)
        .addColumn("comptoirDuLibreId", "integer")
        .addColumn("name", "text", col => col.unique().notNull())
        .addColumn("description", "text", col => col.notNull())
        .addColumn("license", "text", col => col.notNull())
        .addColumn("versionMin", "text", col => col.notNull())
        .addColumn("isPresentInSupportContract", "boolean", col => col.notNull())
        .addColumn("isFromFrenchPublicService", "boolean", col => col.notNull())
        .addColumn("logoUrl", "text")
        .addColumn("keywords", "jsonb", col => col.notNull())
        .addColumn("doRespectRgaa", "boolean")
        // from ???
        .addColumn("isStillInObservation", "boolean", col => col.notNull())
        .addColumn("parentSoftwareWikidataId", "text")
        .addColumn("catalogNumeriqueGouvFrId", "text")
        .addColumn("workshopUrls", "jsonb", col => col.notNull())
        .addColumn("testUrls", "jsonb", col => col.notNull())
        .addColumn("categories", "jsonb", col => col.notNull())
        .addColumn("generalInfoMd", "text")
        .addColumn("addedByAgentEmail", "text", col => col.notNull())
        .addColumn("dereferencing", "jsonb")
        .addColumn("referencedSinceTime", "bigint", col => col.notNull())
        .addColumn("updateTime", "bigint", col => col.notNull())
        .execute();

    await db.schema
        .createTable("software_external_datas")
        .addColumn("externalId", "text", col => col.primaryKey())
        .addColumn("externalDataOrigin", sql`external_data_origin_type`, col => col.notNull())
        .addColumn("developers", "jsonb", col => col.notNull())
        .addColumn("label", "jsonb", col => col.notNull())
        .addColumn("description", "jsonb", col => col.notNull())
        .addColumn("isLibreSoftware", "boolean", col => col.notNull())
        .addColumn("logoUrl", "text")
        .addColumn("framaLibreId", "text")
        .addColumn("websiteUrl", "text")
        .addColumn("sourceUrl", "text")
        .addColumn("documentationUrl", "text")
        .addColumn("license", "text")
        .execute();

    await db.schema
        .createTable("softwares__similar_software_external_datas")
        .addColumn("softwareId", "integer", col => col.notNull().references("softwares.id").onDelete("cascade"))
        .addColumn("similarExternalId", "text", col => col.notNull())
        .addUniqueConstraint("uniq_software_id__similar_software_external_id", ["softwareId", "similarExternalId"])
        .execute();

    await db.schema
        .createTable("software_users")
        .addColumn("softwareId", "integer", col => col.notNull().references("softwares.id").onDelete("cascade"))
        .addColumn("agentId", "integer", col => col.notNull().references("agents.id").onDelete("cascade"))
        .addColumn("useCaseDescription", "text", col => col.notNull())
        .addColumn("os", "text")
        .addColumn("version", "text", col => col.notNull())
        .addColumn("serviceUrl", "text")
        .execute();

    await db.schema
        .createTable("software_referents")
        .addColumn("softwareId", "integer", col => col.notNull().references("softwares.id").onDelete("cascade"))
        .addColumn("agentId", "integer", col => col.notNull().references("agents.id").onDelete("cascade"))
        .addColumn("useCaseDescription", "text", col => col.notNull())
        .addColumn("isExpert", "boolean", col => col.notNull())
        .addColumn("serviceUrl", "text")
        .execute();

    await db.schema
        .createTable("instances")
        .addColumn("id", "serial", col => col.primaryKey())
        .addColumn("mainSoftwareSillId", "integer", col => col.notNull().references("softwares.id").onDelete("cascade"))
        .addColumn("addedByAgentEmail", "text", col => col.notNull())
        .addColumn("organization", "text", col => col.notNull())
        .addColumn("targetAudience", "text", col => col.notNull())
        .addColumn("publicUrl", "text")
        .addColumn("referencedSinceTime", "bigint", col => col.notNull())
        .addColumn("updateTime", "bigint", col => col.notNull())
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable("softwares__similar_software_external_datas").execute();
    await db.schema.dropTable("software_external_datas").execute();
    await db.schema.dropTable("instances").execute();
    await db.schema.dropTable("software_referents").execute();
    await db.schema.dropTable("software_users").execute();
    await db.schema.dropTable("softwares").execute();
    await db.schema.dropTable("agents").execute();
    await db.schema.dropType("external_data_origin_type").execute();
}
