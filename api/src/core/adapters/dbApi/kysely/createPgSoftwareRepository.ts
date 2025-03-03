import { Kysely, sql } from "kysely";
import type { Equals } from "tsafe";
import { assert } from "tsafe/assert";
import { SoftwareRepository } from "../../../ports/DbApiV2";
import { ParentSoftwareExternalData } from "../../../ports/GetSoftwareExternalData";
import { Software } from "../../../usecases/readWriteSillData";
import { Database } from "./kysely.database";
import { stripNullOrUndefinedValues, jsonBuildObject } from "./kysely.utils";

const dateParser = (str: string | Date | undefined | null) => {
    if (str && typeof str === "string") {
        const date = new Date(str);
        return date.valueOf();
    }
    if (str && str instanceof Date) {
        return str.valueOf();
    }
};

export const createPgSoftwareRepository = (db: Kysely<Database>): SoftwareRepository => {
    const getBySoftwareId = makeGetSoftwareById(db);
    return {
        create: async ({ formData, externalDataOrigin, agentId, isReferenced }) => {
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

            return db.transaction().execute(async trx => {
                const { softwareId } = await trx
                    .insertInto("softwares")
                    .values({
                        name: softwareName,
                        description: softwareDescription,
                        license: softwareLicense,
                        logoUrl: softwareLogoUrl,
                        versionMin: softwareMinimalVersion,
                        referencedSinceTime: isReferenced ? now : null,
                        updateTime: now,
                        dereferencing: undefined,
                        isStillInObservation: false,
                        parentSoftwareWikidataId: undefined,
                        doRespectRgaa: doRespectRgaa,
                        isFromFrenchPublicService: isFromFrenchPublicService,
                        isPresentInSupportContract: isPresentInSupportContract,
                        externalId: externalId,
                        externalDataOrigin: externalDataOrigin,
                        comptoirDuLibreId: comptoirDuLibreId,
                        softwareType: JSON.stringify(softwareType),
                        workshopUrls: JSON.stringify([]),
                        categories: JSON.stringify([]),
                        generalInfoMd: undefined,
                        addedByAgentId: agentId,
                        keywords: JSON.stringify(softwareKeywords)
                    })
                    .returning("id as softwareId")
                    .executeTakeFirstOrThrow();

                console.log(
                    `inserted software correctly, softwareId is : ${softwareId} (${softwareName}), about to insert similars : `,
                    similarSoftwareExternalDataIds
                );

                if (similarSoftwareExternalDataIds.length > 0) {
                    await trx
                        .insertInto("softwares__similar_software_external_datas")
                        .values(
                            similarSoftwareExternalDataIds.map(similarExternalId => ({
                                softwareId,
                                similarExternalId
                            }))
                        )
                        .execute();
                }

                console.log("all good");

                return softwareId;
            });
        },
        updateLastExtraDataFetchAt: async ({ softwareId }) => {
            await db
                .updateTable("softwares")
                .set("lastExtraDataFetchAt", sql`now()`)
                .where("id", "=", softwareId)
                .executeTakeFirstOrThrow();
        },
        update: async ({ formData, softwareSillId, agentId }) => {
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
                    versionMin: softwareMinimalVersion || null,
                    updateTime: now,
                    isStillInObservation: false,
                    parentSoftwareWikidataId: undefined,
                    doRespectRgaa: doRespectRgaa,
                    isFromFrenchPublicService: isFromFrenchPublicService,
                    isPresentInSupportContract: isPresentInSupportContract,
                    externalId: externalId,
                    comptoirDuLibreId: comptoirDuLibreId,
                    softwareType: JSON.stringify(softwareType),
                    workshopUrls: JSON.stringify([]),
                    categories: JSON.stringify([]),
                    generalInfoMd: undefined,
                    addedByAgentId: agentId,
                    keywords: JSON.stringify(softwareKeywords)
                })
                .where("id", "=", softwareSillId)
                .execute();
        },
        getByName: async (softwareName: string): Promise<Software | undefined> =>
            makeGetSoftwareBuilder(db)
                .where("name", "=", softwareName)
                .executeTakeFirst()
                .then((result): Software | undefined => {
                    if (!result) return;
                    const {
                        serviceProviders,
                        parentExternalData,
                        updateTime,
                        referencedSinceTime,
                        softwareExternalData,
                        similarExternalSoftwares,
                        ...software
                    } = result;
                    return stripNullOrUndefinedValues({
                        ...software,
                        updateTime: new Date(+updateTime).getTime(),
                        referencedSinceTime: referencedSinceTime ? new Date(+referencedSinceTime).getTime() : undefined,
                        serviceProviders: serviceProviders ?? [],
                        similarSoftwares: similarExternalSoftwares,
                        userAndReferentCountByOrganization: {},
                        authors: (softwareExternalData?.developers ?? []).map(dev => ({
                            "@type": "Person",
                            name: dev.name,
                            url: dev.url,
                            affiliations: dev.affiliations
                        })),
                        officialWebsiteUrl:
                            softwareExternalData?.websiteUrl ??
                            software.comptoirDuLibreSoftware?.external_resources.website,
                        codeRepositoryUrl:
                            softwareExternalData?.sourceUrl ??
                            software.comptoirDuLibreSoftware?.external_resources.repository,
                        documentationUrl: softwareExternalData?.documentationUrl,
                        comptoirDuLibreServiceProviderCount: software.comptoirDuLibreSoftware?.providers.length ?? 0,
                        parentWikidataSoftware: parentExternalData,
                        keywords: software?.keywords ?? softwareExternalData?.keywords ?? [],
                        programmingLanguages: softwareExternalData?.programmingLanguages ?? [],
                        referencePublications: softwareExternalData?.referencePublications,
                        identifiers: softwareExternalData?.identifiers,
                        applicationCategories: software.categories.concat(
                            softwareExternalData?.applicationCategories ?? []
                        ),
                        categories: undefined // merged in applicationCategories, set to undefined to remove it
                    });
                }),
        getById: getBySoftwareId,
        getByIdWithLinkedSoftwaresExternalIds: async softwareId => {
            const software = await getBySoftwareId(softwareId);
            if (!software) return;

            const { parentSoftwareExternalId, similarSoftwaresExternalIds } = await db
                .selectFrom("softwares as s")
                .leftJoin("softwares__similar_software_external_datas as sim", "sim.softwareId", "s.id")
                .select([
                    "s.parentSoftwareWikidataId as parentSoftwareExternalId",
                    qb =>
                        qb.fn
                            .jsonAgg(qb.ref("sim.similarExternalId"))
                            .filterWhere("sim.similarExternalId", "is not", null)
                            .$castTo<string[]>()
                            .as("similarSoftwaresExternalIds")
                ])
                .groupBy("s.id")
                .where("id", "=", softwareId)
                .executeTakeFirstOrThrow();

            return {
                software,
                similarSoftwaresExternalIds: similarSoftwaresExternalIds ?? [],
                parentSoftwareExternalId: parentSoftwareExternalId ?? undefined
            };
        },
        getAll: ({ onlyIfUpdatedMoreThan3HoursAgo } = {}): Promise<Software[]> => {
            // Only software that are referenced in catalog
            let builder = makeGetSoftwareBuilder(db);

            builder.where("s.referencedSinceTime", "is not", null);

            builder = onlyIfUpdatedMoreThan3HoursAgo
                ? builder.where(eb =>
                      eb.or([
                          eb("lastExtraDataFetchAt", "is", null),
                          eb("lastExtraDataFetchAt", "<", sql<Date>`now() - interval '3 hours'`)
                      ])
                  )
                : builder;

            return builder.execute().then(async softwares => {
                const userAndReferentCountByOrganization = await getUserAndReferentCountByOrganizationBySoftwareId(db);

                return softwares.map(
                    ({
                        serviceProviders,
                        parentExternalData,
                        updateTime,
                        referencedSinceTime,
                        softwareExternalData,
                        similarExternalSoftwares,
                        ...software
                    }): Software => {
                        return stripNullOrUndefinedValues({
                            ...software,
                            updateTime: new Date(+updateTime).getTime(),
                            referencedSinceTime: referencedSinceTime
                                ? new Date(+referencedSinceTime).getTime()
                                : undefined,
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
                            latestVersion: software.latestVersion ?? {
                                semVer: softwareExternalData?.softwareVersion ?? undefined,
                                publicationTime: dateParser(softwareExternalData.publicationTime)
                            },
                            userAndReferentCountByOrganization:
                                userAndReferentCountByOrganization[software.softwareId] ?? {},
                            authors: (softwareExternalData?.developers ?? []).map(dev => ({
                                "@type": "Person",
                                name: dev.name,
                                url: dev.url,
                                affiliations: dev.affiliations
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
                            parentWikidataSoftware: parentExternalData ?? undefined,
                            applicationCategories: software.categories.concat(
                                softwareExternalData?.applicationCategories ?? []
                            ),
                            categories: undefined, // merged in applicationCategories, set to undefined to remove it
                            programmingLanguages: softwareExternalData?.programmingLanguages ?? [],
                            referencePublications: softwareExternalData?.referencePublications,
                            identifiers: softwareExternalData?.identifiers
                        });
                    }
                );
            });
        },
        getAllSillSoftwareExternalIds: async externalDataOrigin =>
            db
                .selectFrom("softwares")
                .select("externalId")
                .where("externalDataOrigin", "=", externalDataOrigin)
                .execute()
                .then(rows => rows.map(row => row.externalId!)),

        countAddedByAgent: async ({ agentId }) => {
            const { count } = await db
                .selectFrom("softwares")
                .select(qb => qb.fn.countAll<string>().as("count"))
                .where("addedByAgentId", "=", agentId)
                .executeTakeFirstOrThrow();
            return +count;
        },
        unreference: async ({ softwareId, reason, time }) => {
            const { versionMin } = await db
                .selectFrom("softwares")
                .select("versionMin")
                .where("id", "=", softwareId)
                .executeTakeFirstOrThrow();

            await db
                .updateTable("softwares")
                .set({
                    dereferencing: JSON.stringify({
                        reason,
                        time,
                        lastRecommendedVersion: versionMin
                    })
                })
                .where("id", "=", softwareId)
                .executeTakeFirstOrThrow();
        }
    };
};

const makeGetSoftwareBuilder = (db: Kysely<Database>) =>
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
        .orderBy("s.id", "asc")
        .select([
            "s.id as softwareId",
            ({ fn, ref }) =>
                fn
                    .coalesce(
                        ref("s.logoUrl"),
                        ref("ext.logoUrl"),
                        sql<string>`${ref("cs.comptoirDuLibreSoftware")} ->> 'logoUrl'`
                    )
                    .as("logoUrl"),
            "s.name as softwareName",
            "s.description as softwareDescription",
            "cs.serviceProviders",
            "cs.latestVersion",
            "s.referencedSinceTime",
            "s.updateTime",
            "s.lastExtraDataFetchAt",
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
                            externalId: ref("parentExt.externalId"),
                            label: ref("parentExt.label"),
                            description: ref("parentExt.description")
                        }).$castTo<ParentSoftwareExternalData>()
                    )
                    .else(null)
                    .end()
                    .as("parentExternalData"),
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
                    websiteUrl: ref("ext.websiteUrl"),
                    sourceUrl: ref("ext.sourceUrl"),
                    documentationUrl: ref("ext.documentationUrl"),
                    programmingLanguages: ref("ext.programmingLanguages"),
                    applicationCategories: ref("ext.applicationCategories"),
                    referencePublications: ref("ext.referencePublications"),
                    identifiers: ref("ext.identifiers"),
                    keywords: ref("ext.keywords"),
                    softwareVersion: ref("ext.softwareVersion"),
                    publicationTime: ref("ext.publicationTime")
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
        ]);

type CountForOrganisationAndSoftwareId = {
    organization: string | null;
    softwareId: number;
    type: "user" | "referent";
    count: string;
};

type UserAndReferentCountByOrganizationBySoftwareId = Record<
    string,
    Record<string, { userCount: number; referentCount: number }>
>;

const defaultCount = {
    userCount: 0,
    referentCount: 0
};

const getUserAndReferentCountByOrganizationBySoftwareId = async (
    db: Kysely<Database>
): Promise<UserAndReferentCountByOrganizationBySoftwareId> => {
    const softwareUserCountBySoftwareId: CountForOrganisationAndSoftwareId[] = await db
        .selectFrom("software_users as u")
        .innerJoin("agents as a", "a.id", "u.agentId")
        .select([
            "u.softwareId",
            "a.organization",
            ({ fn }) => fn.countAll<string>().as("count"),
            sql<"user">`'userCount'`.as("type")
        ])
        .groupBy(["a.organization", "u.softwareId"])
        .execute();

    const softwareReferentCountBySoftwareId: CountForOrganisationAndSoftwareId[] = await db
        .selectFrom("software_referents as r")
        .innerJoin("agents as a", "a.id", "r.agentId")
        .select([
            "r.softwareId",
            "a.organization",
            ({ fn }) => fn.countAll<string>().as("count"),
            sql<"referent">`'referentCount'`.as("type")
        ])
        .groupBy(["a.organization", "r.softwareId"])
        .execute();

    return [...softwareReferentCountBySoftwareId, ...softwareUserCountBySoftwareId].reduce(
        (acc, { organization, softwareId, type, count }): UserAndReferentCountByOrganizationBySoftwareId => {
            const orga = organization ?? "NO_ORGANIZATION";
            return {
                ...acc,
                [softwareId]: {
                    ...(acc[softwareId] ?? {}),
                    [orga]: {
                        ...(acc[softwareId]?.[orga] ?? defaultCount),
                        [type]: +count
                    }
                }
            };
        },
        {} as UserAndReferentCountByOrganizationBySoftwareId
    );
};

const filterDuplicate = (array: any[]) => {
    return array.filter(function (item: any, pos: number) {
        return array.indexOf(item) == pos;
    });
};

const makeGetSoftwareById =
    (db: Kysely<Database>) =>
    async (softwareId: number): Promise<Software | undefined> =>
        makeGetSoftwareBuilder(db)
            .where("id", "=", softwareId)
            .executeTakeFirst()
            .then((result): Software | undefined => {
                if (!result) return;
                const {
                    serviceProviders,
                    parentExternalData,
                    updateTime,
                    referencedSinceTime,
                    softwareExternalData,
                    similarExternalSoftwares,
                    ...software
                } = result;
                return stripNullOrUndefinedValues({
                    ...software,
                    updateTime: new Date(+updateTime).getTime(),
                    referencedSinceTime: referencedSinceTime ? new Date(+referencedSinceTime).getTime() : undefined,
                    isReferenced: referencedSinceTime ? true : false,
                    serviceProviders: serviceProviders ?? [],
                    similarSoftwares: similarExternalSoftwares,
                    userAndReferentCountByOrganization: {},
                    authors: (softwareExternalData?.developers ?? []).map(dev => ({
                        "@type": "Person",
                        name: dev.name,
                        url: dev.url,
                        affiliations: dev.affiliations
                    })),
                    officialWebsiteUrl:
                        softwareExternalData?.websiteUrl ??
                        software.comptoirDuLibreSoftware?.external_resources.website,
                    codeRepositoryUrl:
                        softwareExternalData?.sourceUrl ??
                        software.comptoirDuLibreSoftware?.external_resources.repository,
                    documentationUrl: softwareExternalData?.documentationUrl,
                    comptoirDuLibreServiceProviderCount: software.comptoirDuLibreSoftware?.providers.length ?? 0,
                    parentWikidataSoftware: parentExternalData,
                    programmingLanguages: softwareExternalData?.programmingLanguages ?? [],
                    referencePublications: softwareExternalData?.referencePublications,
                    identifiers: softwareExternalData?.identifiers,
                    applicationCategories: filterDuplicate(
                        software.categories.concat(softwareExternalData?.applicationCategories ?? [])
                    ),
                    categories: undefined // merged in applicationCategories, set to undefined to remove it
                });
            });
