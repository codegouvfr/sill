import { Kysely, sql } from "kysely";
import type { Equals } from "tsafe";
import { assert } from "tsafe/assert";
import { SoftwareRepository } from "../../../ports/DbApiV2";
import { ParentSoftwareExternalData } from "../../../ports/GetSoftwareExternalData";
import { Software } from "../../../usecases/readWriteSillData";
import { Database } from "./kysely.database";
import { convertNullValuesToUndefined, jsonBuildObject } from "./kysely.utils";

export const createPgSoftwareRepository = (db: Kysely<Database>): SoftwareRepository => ({
    create: async ({ formData, externalDataOrigin, agentEmail }) => {
        const {
            softwareName,
            softwareDescription,
            softwareLicense,
            softwareLogoUrl,
            softwareMinimalVersion,
            isPresentInSupportContract,
            isFromFrenchPublicService,
            doRespectRgaa,
            similarSoftwareExternalDataIds,
            softwareType,
            externalId,
            comptoirDuLibreId,
            softwareKeywords,
            ...rest
        } = formData;

        assert<Equals<typeof rest, {}>>();

        const now = Date.now();
        await db
            .insertInto("softwares")
            .values({
                name: softwareName,
                description: softwareDescription,
                license: softwareLicense,
                logoUrl: softwareLogoUrl,
                versionMin: softwareMinimalVersion,
                referencedSinceTime: now,
                updateTime: now,
                dereferencing: undefined,
                isStillInObservation: false,
                parentSoftwareWikidataId: undefined,
                doRespectRgaa: doRespectRgaa,
                isFromFrenchPublicService: isFromFrenchPublicService,
                isPresentInSupportContract: isPresentInSupportContract,
                similarSoftwareExternalDataIds: JSON.stringify(similarSoftwareExternalDataIds),
                externalId: externalId,
                externalDataOrigin: externalDataOrigin,
                comptoirDuLibreId: comptoirDuLibreId,
                softwareType: JSON.stringify(softwareType),
                catalogNumeriqueGouvFrId: undefined,
                workshopUrls: JSON.stringify([]),
                testUrls: JSON.stringify([]),
                categories: JSON.stringify([]),
                generalInfoMd: undefined,
                addedByAgentEmail: agentEmail,
                keywords: JSON.stringify(softwareKeywords)
            })
            .execute();
    },
    update: async ({ formData, softwareSillId, agentEmail }) => {
        const {
            softwareName,
            softwareDescription,
            softwareLicense,
            softwareLogoUrl,
            softwareMinimalVersion,
            isPresentInSupportContract,
            isFromFrenchPublicService,
            doRespectRgaa,
            similarSoftwareExternalDataIds,
            softwareType,
            externalId,
            comptoirDuLibreId,
            softwareKeywords,
            ...rest
        } = formData;

        assert<Equals<typeof rest, {}>>();

        const now = Date.now();
        await db
            .updateTable("softwares")
            .set({
                name: softwareName,
                description: softwareDescription,
                license: softwareLicense,
                logoUrl: softwareLogoUrl,
                versionMin: softwareMinimalVersion,
                updateTime: now,
                isStillInObservation: false,
                parentSoftwareWikidataId: undefined,
                doRespectRgaa: doRespectRgaa,
                isFromFrenchPublicService: isFromFrenchPublicService,
                isPresentInSupportContract: isPresentInSupportContract,
                similarSoftwareExternalDataIds: JSON.stringify(similarSoftwareExternalDataIds),
                externalId: externalId,
                comptoirDuLibreId: comptoirDuLibreId,
                softwareType: JSON.stringify(softwareType),
                catalogNumeriqueGouvFrId: undefined,
                workshopUrls: JSON.stringify([]),
                testUrls: JSON.stringify([]),
                categories: JSON.stringify([]),
                generalInfoMd: undefined,
                addedByAgentEmail: agentEmail,
                keywords: JSON.stringify(softwareKeywords)
            })
            .where("id", "=", softwareSillId)
            .execute();
    },
    getAll: (): Promise<Software[]> =>
        db
            .selectFrom("softwares as s")
            .leftJoin("software_external_datas as ext", "ext.externalId", "s.externalId")
            .leftJoin("compiled_softwares as cs", "cs.softwareId", "s.id")
            .leftJoin("software_external_datas as parentExt", "s.parentSoftwareWikidataId", "parentExt.externalId")
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
                "cs.softwareId",
                "cs.annuaireCnllServiceProviders",
                "cs.comptoirDuLibreSoftware",
                "cs.latestVersion",
                "cs.serviceProviders",
                "ext.externalId",
                "parentExt.externalId"
            ])
            .select([
                "s.id as softwareId",
                "s.logoUrl",
                "s.name as softwareName",
                "s.description as softwareDescription",
                "cs.serviceProviders",
                "cs.latestVersion",
                "s.testUrls",
                "s.referencedSinceTime as addedTime",
                "s.updateTime",
                "s.dereferencing",
                "s.categories",
                ({ ref }) =>
                    jsonBuildObject({
                        isPresentInSupportContract: ref("isPresentInSupportContract"),
                        isFromFrenchPublicServices: ref("isFromFrenchPublicService"),
                        doRespectRgaa: ref("doRespectRgaa")
                    }).as("prerogatives"),
                "s.comptoirDuLibreId",
                "cs.comptoirDuLibreSoftware",
                "s.versionMin",
                "s.license",
                "annuaireCnllServiceProviders",
                "s.externalId",
                "s.externalDataOrigin",
                "s.softwareType",
                ({ ref, ...qb }) =>
                    qb
                        .case()
                        .when("parentExt.externalId", "is not", null)
                        .then(
                            jsonBuildObject({
                                externalId: ref("ext.externalId"),
                                label: ref("ext.label"),
                                description: ref("ext.description")
                            }).$castTo<ParentSoftwareExternalData>()
                        )
                        .else(null)
                        .end()
                        .as("parentExternalData"),
                "s.similarSoftwareExternalDataIds",
                "s.keywords",

                ({ ref }) =>
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
                        documentationUrl: ref("ext.documentationUrl")
                    }).as("softwareExternalData"),
                ({ ref, fn }) =>
                    fn
                        .coalesce(
                            fn
                                .jsonAgg(
                                    jsonBuildObject({
                                        isInSill: sql<false>`false`,
                                        externalId: ref("similarExt.externalId"),
                                        label: ref("similarExt.label"),
                                        description: ref("similarExt.description"),
                                        isLibreSoftware: ref("similarExt.isLibreSoftware"),
                                        externalDataOrigin: ref("similarExt.externalDataOrigin")
                                    }).$castTo<Software.SimilarSoftware>()
                                )
                                .filterWhere("similarExt.externalId", "is not", null),
                            sql<[]>`'[]'`
                        )
                        .as("similarExternalSoftwares")
            ])
            .execute()
            .then(softwares =>
                softwares.map(
                    ({
                        testUrls,
                        serviceProviders,
                        similarSoftwareExternalDataIds,
                        parentExternalData,
                        updateTime,
                        addedTime,
                        softwareExternalData,
                        similarExternalSoftwares,
                        ...software
                    }): Software => {
                        return {
                            ...convertNullValuesToUndefined(software),
                            updateTime: new Date(+updateTime).getTime(),
                            addedTime: new Date(+addedTime).getTime(),
                            serviceProviders: serviceProviders ?? [],
                            similarSoftwares: similarExternalSoftwares,
                            // (similarSoftwares ?? []).map(
                            //     (s): SimilarSoftware => ({
                            //         softwareName:
                            //             typeof s.label === "string" ? s.label : Object.values(s.label)[0]!,
                            //         softwareDescription:
                            //             typeof s.label === "string" ? s.label : Object.values(s.label)[0]!,
                            //         isInSill: true // TODO: check if this is true
                            //     })
                            // ) ?? [],
                            userAndReferentCountByOrganization: {},
                            authors: (softwareExternalData?.developers ?? []).map(dev => ({
                                authorName: dev.name,
                                authorUrl: `https://www.wikidata.org/wiki/${dev.id}`
                            })),
                            officialWebsiteUrl:
                                softwareExternalData?.websiteUrl ??
                                software.comptoirDuLibreSoftware?.external_resources.website ??
                                undefined,
                            codeRepositoryUrl:
                                softwareExternalData?.sourceUrl ??
                                software.comptoirDuLibreSoftware?.external_resources.repository ??
                                undefined,
                            documentationUrl: softwareExternalData?.documentationUrl ?? undefined,
                            comptoirDuLibreServiceProviderCount:
                                software.comptoirDuLibreSoftware?.providers.length ?? 0,
                            testUrl: testUrls[0]?.url,
                            parentWikidataSoftware: parentExternalData ?? undefined
                        };
                    }
                )
            ),
    unreference: async () => {}
});
