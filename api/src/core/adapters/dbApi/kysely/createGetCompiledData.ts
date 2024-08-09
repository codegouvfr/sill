import { Kysely } from "kysely";
import { CompiledData } from "../../../ports/CompileData";
import { Db } from "../../../ports/DbApi";
import { ParentSoftwareExternalData, SoftwareExternalData } from "../../../ports/GetSoftwareExternalData";
import { Database } from "./kysely.database";
import { stripNullOrUndefinedValues, isNotNull, jsonBuildObject, jsonStripNulls } from "./kysely.utils";

export const createGetCompiledData = (db: Kysely<Database>) => async (): Promise<CompiledData<"private">> => {
    console.time("agentById query");
    const agentById: Record<number, Db.AgentRow> = await db
        .selectFrom("agents")
        .selectAll()
        .execute()
        .then(agents => agents.reduce((acc, agent) => ({ ...acc, [agent.id]: agent }), {}));
    console.timeEnd("agentById query");

    console.time("softwares query");
    const compliedSoftwares = await db
        .selectFrom("softwares as s")
        .leftJoin("compiled_softwares as csft", "csft.softwareId", "s.id")
        .leftJoin("software_referents as referents", "s.id", "referents.softwareId")
        .leftJoin("software_users as users", "s.id", "users.softwareId")
        .leftJoin("instances", "s.id", "instances.mainSoftwareSillId")
        .leftJoin("software_external_datas as ext", "ext.externalId", "s.externalId")
        .leftJoin("software_external_datas as parentExt", "parentExt.externalId", "s.parentSoftwareWikidataId")
        .leftJoin(
            "softwares__similar_software_external_datas",
            "softwares__similar_software_external_datas.softwareId",
            "s.id"
        )
        .leftJoin(
            "software_external_datas as similarExt",
            "softwares__similar_software_external_datas.similarExternalId",
            "similarExt.externalId"
        )
        .groupBy([
            "s.id",
            "csft.softwareId",
            "csft.annuaireCnllServiceProviders",
            "csft.comptoirDuLibreSoftware",
            "csft.latestVersion",
            "csft.serviceProviders",
            "parentExt.externalId",
            "ext.externalId"
        ])
        .select([
            "s.id",
            "s.addedByAgentEmail",
            "s.catalogNumeriqueGouvFrId",
            "s.categories",
            "s.dereferencing",
            "s.description",
            "s.doRespectRgaa",
            "s.externalDataOrigin",
            "s.externalId",
            "s.generalInfoMd",
            "s.isFromFrenchPublicService",
            "s.isPresentInSupportContract",
            "s.isStillInObservation",
            "s.keywords",
            "s.license",
            "s.logoUrl",
            "s.name",
            "s.referencedSinceTime",
            "s.softwareType",
            "s.testUrls",
            "s.updateTime",
            "s.versionMin",
            "s.workshopUrls",
            "csft.softwareId as externalDataSoftwareId",
            "csft.annuaireCnllServiceProviders",
            "csft.comptoirDuLibreSoftware",
            "csft.latestVersion",
            "csft.serviceProviders",
            ({ ref, ...qb }) =>
                qb
                    .case()
                    .when("parentExt.externalId", "is not", null)
                    .then(
                        jsonBuildObject({
                            externalId: ref("parentExt.externalId"),
                            label: ref("parentExt.label"),
                            description: ref("parentExt.description")
                        }).$castTo<ParentSoftwareExternalData>()
                    )
                    .end()
                    .as("parentWikidataSoftware"),
            ({ ref, ...qb }) =>
                qb
                    .case()
                    .when("ext.externalId", "is not", null)
                    .then(
                        jsonStripNulls(
                            jsonBuildObject({
                                externalId: ref("ext.externalId"),
                                externalDataOrigin: ref("ext.externalDataOrigin"),
                                developers: ref("ext.developers"),
                                label: ref("ext.label"),
                                description: ref("ext.description"),
                                isLibreSoftware: ref("ext.isLibreSoftware"),
                                logoUrl: ref("ext.logoUrl"),
                                framaLibreId: ref("ext.framaLibreId"),
                                websiteUrl: ref("ext.websiteUrl"),
                                sourceUrl: ref("ext.sourceUrl"),
                                documentationUrl: ref("ext.documentationUrl"),
                                license: ref("ext.license")
                            })
                        ).$castTo<SoftwareExternalData>()
                    )
                    .end()
                    .as("softwareExternalData"),
            ({ fn }) => fn.jsonAgg("similarExt").distinct().as("similarExternalSoftwares"),
            ({ fn }) => fn.jsonAgg("users").distinct().as("users"),
            ({ fn }) => fn.jsonAgg("referents").distinct().as("referents"),
            ({ fn }) => fn.jsonAgg("instances").distinct().as("instances")
        ])
        .execute()
        .then(results => {
            console.timeEnd("softwares query");
            console.time("software processing");
            const processedSoftwares = results.map(
                ({
                    externalDataSoftwareId,
                    annuaireCnllServiceProviders,
                    comptoirDuLibreSoftware,
                    latestVersion,
                    parentWikidataSoftware,
                    serviceProviders,
                    similarExternalSoftwares,
                    dereferencing,
                    doRespectRgaa,
                    users,
                    referents,
                    instances,
                    softwareExternalData,
                    updateTime,
                    referencedSinceTime,
                    ...software
                }): CompiledData.Software<"private"> => {
                    return {
                        ...stripNullOrUndefinedValues(software),
                        updateTime: new Date(+updateTime).getTime(),
                        referencedSinceTime: new Date(+referencedSinceTime).getTime(),
                        doRespectRgaa,
                        softwareExternalData: softwareExternalData ?? undefined,
                        annuaireCnllServiceProviders: annuaireCnllServiceProviders ?? undefined,
                        comptoirDuLibreSoftware: comptoirDuLibreSoftware ?? undefined,
                        latestVersion: latestVersion ?? undefined,
                        parentWikidataSoftware: parentWikidataSoftware ?? undefined,
                        dereferencing: dereferencing ?? undefined,
                        serviceProviders: serviceProviders ?? [],
                        similarExternalSoftwares: (similarExternalSoftwares ?? [])
                            .filter(isNotNull)
                            .map(similar => ({
                                "externalId": similar.externalId!,
                                "externalDataOrigin": similar.externalDataOrigin!,
                                "label": similar.label!,
                                "description": similar.description!,
                                "isLibreSoftware": similar.isLibreSoftware!
                            }))
                            .sort((a, b) => a.externalId.localeCompare(b.externalId)),
                        users: users.filter(isNotNull).map(user => ({
                            ...(user as any),
                            organization: agentById[user.agentId!]?.organization
                        })),
                        referents: referents.filter(isNotNull).map(referent => ({
                            ...(referent as any),
                            organization: agentById[referent.agentId!]?.organization
                        })),
                        instances: (instances ?? []).filter(isNotNull).map(instance => ({
                            id: instance.id!,
                            organization: instance.organization!,
                            targetAudience: instance.targetAudience!,
                            publicUrl: instance.publicUrl ?? undefined,
                            addedByAgentEmail: instance.addedByAgentEmail!,
                            otherWikidataSoftwares: []
                        }))
                    };
                }
            );
            console.timeEnd("software processing");
            return processedSoftwares;
        });

    console.log("numberOfCompiledSoftwares : ", compliedSoftwares.length);
    return compliedSoftwares;
};
