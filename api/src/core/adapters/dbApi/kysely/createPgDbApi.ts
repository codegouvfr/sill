import { Kysely, sql } from "kysely";
import type { Equals } from "tsafe";
import { assert } from "tsafe/assert";
import { CompiledData } from "../../../ports/CompileData";
import { Db } from "../../../ports/DbApi";
import {
    ExternalDataOrigin,
    ParentSoftwareExternalData,
    SoftwareExternalData
} from "../../../ports/GetSoftwareExternalData";
import {
    DeclarationFormData,
    Instance,
    InstanceFormData,
    Software,
    SoftwareFormData
} from "../../../usecases/readWriteSillData";
import { Database } from "./kysely.database";
import { jsonBuildObject } from "./kysely.utils";

type Agent = { id: number; email: string; organization: string };
type WithAgent = { agent: Agent };

type NewDbApi = {
    software: {
        create: (
            params: { formData: SoftwareFormData; externalDataOrigin: ExternalDataOrigin } & WithAgent
        ) => Promise<void>;
        update: (params: { softwareSillId: number; formData: SoftwareFormData } & WithAgent) => Promise<void>;
        getAll: () => Promise<Software[]>;
        unreference: () => {};
    };
    instance: {
        create: (params: { fromData: InstanceFormData } & WithAgent) => Promise<void>;
        update: (params: { fromData: InstanceFormData; instanceId: number } & WithAgent) => Promise<void>;
        getAll: () => Promise<Instance[]>;
    };
    agent: {
        createUserOrReferent: (params: { fromData: DeclarationFormData; softwareName: string }) => Promise<void>;
        removeUserOrReferent: () => {};
        updateIsProfilePublic: () => {};
        updateAbout: () => {};
        getIsProfilePublic: () => {};
        getByEmail: () => {};
        getAll: () => {};
        changeOrganization: () => {};
        updateEmail: () => {};
        getTotalReferentCount: () => {};
    };
    getCompiledDataPrivate: () => Promise<CompiledData<"private">>;
};

export type PgDbApi = ReturnType<typeof createKyselyPgDbApi>;
export const createKyselyPgDbApi = (db: Kysely<Database>): NewDbApi => {
    return {
        software: {
            create: async ({ formData, externalDataOrigin, agent }) => {
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
                        addedByAgentEmail: agent.email,
                        keywords: JSON.stringify(softwareKeywords)
                    })
                    .execute();
            },
            update: async ({ formData, softwareSillId, agent }) => {
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
                        addedByAgentEmail: agent.email,
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
                    .leftJoin(
                        "software_external_datas as parentExt",
                        "s.parentSoftwareWikidataId",
                        "parentExt.externalId"
                    )
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
                        // ({ fn }) => fn.jsonAgg("similarExt").distinct().as("similarExternalSoftwares")
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
        },
        instance: {
            create: async ({ fromData, agent }) => {
                const {
                    mainSoftwareSillId,
                    organization,
                    targetAudience,
                    publicUrl,
                    otherSoftwareWikidataIds,
                    ...rest
                } = fromData;
                assert<Equals<typeof rest, {}>>();

                const now = Date.now();
                await db
                    .insertInto("instances")
                    .values({
                        addedByAgentEmail: agent.email,
                        updateTime: now,
                        referencedSinceTime: now,
                        mainSoftwareSillId,
                        organization,
                        targetAudience,
                        publicUrl
                    })
                    .execute();
            },
            update: async ({ fromData, instanceId }) => {
                const {
                    mainSoftwareSillId,
                    organization,
                    targetAudience,
                    publicUrl,
                    otherSoftwareWikidataIds,
                    ...rest
                } = fromData;
                assert<Equals<typeof rest, {}>>();

                const now = Date.now();
                await db
                    .updateTable("instances")
                    .set({
                        updateTime: now,
                        referencedSinceTime: now,
                        mainSoftwareSillId,
                        organization,
                        targetAudience,
                        publicUrl
                    })
                    .where("id", "=", instanceId)
                    .execute();
            },
            getAll: async () =>
                db
                    .selectFrom("instances as i")
                    .leftJoin("instances__other_external_softwares as ioes", "ioes.instanceId", "i.id")
                    .leftJoin("software_external_datas as ext", "ext.externalId", "ioes.externalId")
                    .select([
                        "i.id",
                        "i.mainSoftwareSillId",
                        "i.organization",
                        "i.targetAudience",
                        "i.publicUrl",
                        ({ fn }) =>
                            fn
                                .jsonAgg("ext")
                                .distinct()
                                .$castTo<ParentSoftwareExternalData[]>()
                                .as("otherWikidataSoftwares")
                        // ({ ref, fn }) =>
                        //     fn
                        //         .jsonAgg(
                        //             jsonBuildObject({
                        //                 externalId: ref("ext.externalId"),
                        //                 label: ref("ext.label"),
                        //                 description: ref("ext.description")
                        //             }).$castTo<ParentSoftwareExternalData>()
                        //         )
                        //         .as("otherWikidataSoftwares")
                    ])
                    .execute()
                    .then(instances =>
                        instances.map(
                            (instance): Instance => ({
                                ...instance,
                                publicUrl: instance.publicUrl ?? undefined,
                                otherWikidataSoftwares: instance.otherWikidataSoftwares
                            })
                        )
                    )
        },
        agent: {
            createUserOrReferent: async () => {},
            removeUserOrReferent: async () => {},
            updateIsProfilePublic: async () => {},
            updateAbout: async () => {},
            getIsProfilePublic: async () => {},
            getByEmail: async () => {},
            getAll: async () => {},
            changeOrganization: async () => {},
            updateEmail: async () => {},
            getTotalReferentCount: async () => {}
        },
        getCompiledDataPrivate: async (): Promise<CompiledData<"private">> => {
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
                    "parentExt.externalId"
                    // "csft.similarExternalSoftwares",
                    // "csft.softwareExternalData"
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
                    // "csft.parentWikidataSoftware",
                    // "csft.similarExternalSoftwares",
                    ({ ref }) =>
                        jsonBuildObject({
                            externalId: ref("parentExt.externalId"),
                            label: ref("parentExt.label"),
                            description: ref("parentExt.description")
                        })
                            .$castTo<ParentSoftwareExternalData>()
                            .as("parentWikidataSoftware"),
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
                        })
                            .$castTo<SoftwareExternalData>()
                            .as("softwareExternalData"),
                    ({ ref, fn }) =>
                        fn
                            .jsonAgg(
                                jsonBuildObject({
                                    externalId: ref("similarExt.externalId"),
                                    label: ref("similarExt.label"),
                                    description: ref("similarExt.description"),
                                    isLibreSoftware: ref("similarExt.isLibreSoftware"),
                                    externalDataOrigin: ref("similarExt.externalDataOrigin")
                                }).$castTo<SoftwareExternalData>()
                            )
                            .as("similarExternalSoftwares"),
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
                                ...convertNullValuesToUndefined(software),
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
                                similarExternalSoftwares: similarExternalSoftwares ?? [],
                                users: users.filter(isNotNull).map(user => ({
                                    ...(user as any),
                                    organization: agentById[user.agentId!]?.organization
                                })),
                                referents: referents.filter(isNotNull).map(referent => ({
                                    ...(referent as any),
                                    organization: agentById[referent.agentId!]?.organization
                                })),
                                instances: instances.filter(isNotNull).map(instance => ({
                                    ...(instance as any)
                                }))
                            };
                        }
                    );
                    console.timeEnd("software processing");
                    return processedSoftwares;
                });

            return compliedSoftwares;
        }
    };
};

const isNotNull = <T>(value: T | null): value is T => value !== null;

const convertNullValuesToUndefined = <T extends Record<string, unknown>>(
    obj: T
): { [K in keyof T]: null extends T[K] ? Exclude<T[K], null> | undefined : T[K] } =>
    Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, value === null ? undefined : value])) as any;
