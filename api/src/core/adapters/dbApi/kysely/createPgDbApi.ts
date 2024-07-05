import { Kysely } from "kysely";
import { CompiledData } from "../../../ports/CompileData";
import { SoftwareExternalData } from "../../../ports/GetSoftwareExternalData";
import { ServiceProvider } from "../../../usecases/readWriteSillData";
import { Database } from "./kysely.database";
import { createPgDialect } from "./kysely.dialect";
import { emptyArrayIfNull, jsonAggOrEmptyArray, jsonBuildObject, jsonStripNulls } from "./kysely.utils";

export const createKyselyPgDbApi = (dbUrl: string) => {
    const db = new Kysely<Database>({ dialect: createPgDialect(dbUrl) });

    return {
        // getSoftwareById: async (id: number): Promise<Db.SoftwareRow | undefined> => {
        //     const result = await db.selectFrom("softwares").selectAll().where("id", "=", id).executeTakeFirst();
        //     if (!result) return;
        //
        //     return {
        //         ...result,
        //         parentSoftwareWikidataId: result?.parentSoftwareWikidataId ?? undefined,
        //         dereferencing: result?.dereferencing ?? undefined,
        //         externalId: result?.externalId ?? undefined,
        //         externalDataOrigin: result?.externalDataOrigin ?? "wikidata",
        //         comptoirDuLibreId: result?.comptoirDuLibreId ?? undefined,
        //         catalogNumeriqueGouvFrId: result?.catalogNumeriqueGouvFrId ?? undefined,
        //         generalInfoMd: result?.generalInfoMd ?? undefined,
        //         logoUrl: result?.logoUrl ?? undefined
        //     };
        // },
        getCompiledDataPrivate: (): Promise<CompiledData<"private">> => {
            return db
                .selectFrom("softwares as s")
                .leftJoin("compiled_softwares as csft", "csft.softwareId", "s.id")
                .leftJoin("software_referents as referents", "s.id", "referents.softwareId")
                .leftJoin("software_users as users", "s.id", "users.softwareId")
                .leftJoin("agents as ar", "referents.agentId", "ar.id")
                .leftJoin("agents as au", "referents.agentId", "au.id")
                .leftJoin("instances", "s.id", "instances.mainSoftwareSillId")
                .select(({ ref, fn }) =>
                    // jsonStripNulls(
                    jsonStripNulls(
                        jsonBuildObject({
                            addedByAgentEmail: ref("s.addedByAgentEmail"),
                            annuaireCnllServiceProviders: ref("annuaireCnllServiceProviders"),
                            catalogNumeriqueGouvFrId: ref("s.catalogNumeriqueGouvFrId"),
                            categories: ref("s.categories"),
                            comptoirDuLibreSoftware: ref("csft.comptoirDuLibreSoftware"),
                            dereferencing: ref("s.dereferencing"),
                            description: ref("s.description"),
                            doRespectRgaa: ref("s.doRespectRgaa"),
                            externalDataOrigin: ref("s.externalDataOrigin"),
                            externalId: ref("s.externalId"),
                            generalInfoMd: ref("s.generalInfoMd"),
                            id: ref("s.id"),
                            isFromFrenchPublicService: ref("s.isFromFrenchPublicService"),
                            isPresentInSupportContract: ref("s.isPresentInSupportContract"),
                            isStillInObservation: ref("s.isStillInObservation"),
                            keywords: ref("s.keywords"),
                            latestVersion: ref("csft.latestVersion"),
                            license: ref("s.license"),
                            logoUrl: ref("s.logoUrl"),
                            name: ref("s.name"),
                            parentWikidataSoftware: ref("csft.parentWikidataSoftware"),
                            referencedSinceTime: ref("s.referencedSinceTime"),
                            serviceProviders: emptyArrayIfNull(fn, ref("csft.serviceProviders")).$castTo<
                                ServiceProvider[]
                            >(),
                            similarExternalSoftwares: emptyArrayIfNull(
                                fn,
                                ref("csft.similarExternalSoftwares")
                            ).$castTo<CompiledData.SimilarSoftware[]>(),
                            softwareExternalData: ref("csft.softwareExternalData"),
                            softwareType: ref("s.softwareType"),
                            testUrls: ref("s.testUrls"),
                            updateTime: ref("s.updateTime"),
                            versionMin: ref("s.versionMin"),
                            workshopUrls: ref("s.workshopUrls"),
                            referents: jsonAggOrEmptyArray(
                                fn,
                                jsonStripNulls(
                                    jsonBuildObject({
                                        email: ref("ar.email").$castTo<string>(),
                                        organization: ref("ar.organization").$castTo<string>(),
                                        isExpert: ref("referents.isExpert").$castTo<boolean>(),
                                        serviceUrl: ref("referents.serviceUrl"),
                                        useCaseDescription: ref("referents.useCaseDescription").$castTo<string>()
                                    })
                                )
                            ),
                            users: jsonAggOrEmptyArray(
                                fn,
                                jsonStripNulls(
                                    jsonBuildObject({
                                        os: ref("users.os"),
                                        serviceUrl: ref("users.serviceUrl"),
                                        useCaseDescription: ref("users.useCaseDescription").$castTo<string>(),
                                        version: ref("users.version").$castTo<string>(),
                                        organization: ref("au.organization").$castTo<string>()
                                    })
                                )
                            ),
                            instances: jsonAggOrEmptyArray(
                                fn,
                                jsonStripNulls(
                                    jsonBuildObject({
                                        id: ref("instances.id").$castTo<number>(),
                                        organization: ref("instances.organization").$castTo<string>(),
                                        targetAudience: ref("instances.targetAudience").$castTo<string>(),
                                        publicUrl: ref("instances.publicUrl"),
                                        otherWikidataSoftwares: ref("instances.otherSoftwareWikidataIds").$castTo<
                                            SoftwareExternalData[]
                                        >(), // todo fetch the corresponding softwares,
                                        addedByAgentEmail: ref("instances.addedByAgentEmail").$castTo<string>()
                                    })
                                )
                            )
                        })
                    ).as("compliedSoftware")
                )
                .execute()
                .then(results =>
                    results.map(
                        ({ compliedSoftware }): CompiledData.Software<"private"> => ({
                            ...compliedSoftware,
                            doRespectRgaa: compliedSoftware.doRespectRgaa ?? null
                        })
                    )
                );
        }
    };
};

// ----------- common -----------
// annuaireCnllServiceProviders
// catalogNumeriqueGouvFrId
// categories
// comptoirDuLibreSoftware
// dereferencing
// description
// doRespectRgaa
// externalDataOrigin
// externalId
// generalInfoMd
// id
// isFromFrenchPublicService
// isPresentInSupportContract
// isStillInObservation
// keywords
// latestVersion
// license
// logoUrl
// name
// parentWikidataSoftware
// referencedSinceTime
// serviceProviders
// similarExternalSoftwares
// softwareExternalData
// softwareType
// testUrls
// updateTime
// versionMin
// workshopUrls
//
// ----------- private -----------
// addedByAgentEmail
// users
// referents
// instances
//
// ----------- public -----------
// userAndReferentCountByOrganization
// hasExpertReferent
// instances
