import { ServiceProvider } from "../usecases/readWriteSillData";
import type { Db } from "./DbApi";
import type { SoftwareExternalData } from "./GetSoftwareExternalData";
import type { ComptoirDuLibre } from "./ComptoirDuLibreApi";

export type CompileData = (params: {
    db: Db;
    getCachedSoftware: ((params: { sillSoftwareId: number }) => CompileData.PartialSoftware | undefined) | undefined;
}) => Promise<CompiledData<"private">>;

export namespace CompileData {
    export type PartialSoftware = Pick<
        CompiledData.Software<"private">,
        "softwareExternalData" | "latestVersion" | "similarExternalSoftwares" | "parentWikidataSoftware"
    > & {
        comptoirDuLibreSoftware:
            | {
                  id: number;
                  logoUrl: string | undefined;
                  keywords: string[] | undefined;
              }
            | undefined;
        instances: Pick<CompiledData.Instance, "id" | "otherWikidataSoftwares">[];
    };
}

export type CompiledData<T extends "private" | "public"> = CompiledData.Software<T>[];

export namespace CompiledData {
    export type Software<T extends "private" | "public"> = T extends "private" ? Software.Private : Software.Public;
    export namespace Software {
        export type Common = Pick<
            Db.SoftwareRow,
            | "id"
            | "name"
            | "description"
            | "referencedSinceTime"
            | "updateTime"
            | "dereferencing"
            | "isStillInObservation"
            | "doRespectRgaa"
            | "isFromFrenchPublicService"
            | "isPresentInSupportContract"
            | "license"
            | "softwareType"
            | "catalogNumeriqueGouvFrId"
            | "versionMin"
            | "workshopUrls"
            | "testUrls"
            | "categories"
            | "generalInfoMd"
            | "logoUrl"
            | "keywords"
            | "externalId"
            | "externalDataOrigin"
        > & {
            serviceProviders: ServiceProvider[];
            softwareExternalData: SoftwareExternalData | undefined;
            similarExternalSoftwares: Pick<
                SoftwareExternalData,
                "externalId" | "label" | "description" | "isLibreSoftware" | "externalDataOrigin"
            >[];
            parentWikidataSoftware: Pick<SoftwareExternalData, "externalId" | "label" | "description"> | undefined;
            comptoirDuLibreSoftware:
                | (ComptoirDuLibre.Software & { logoUrl: string | undefined; keywords: string[] | undefined })
                | undefined;
            annuaireCnllServiceProviders:
                | {
                      name: string;
                      siren: string;
                      url: string;
                  }[]
                | undefined;
            latestVersion:
                | {
                      semVer: string;
                      publicationTime: number;
                  }
                | undefined;
        };

        export type Public = Common & {
            userAndReferentCountByOrganization: Record<string, { userCount: number; referentCount: number }>;
            hasExpertReferent: boolean;
            instances: Instance[];
        };

        export type Private = Common & {
            addedByAgentEmail: string;
            users: (Pick<Db.AgentRow, "organization"> &
                Pick<Db.SoftwareUserRow, "os" | "serviceUrl" | "useCaseDescription" | "version">)[];
            referents: (Pick<Db.AgentRow, "email" | "organization"> &
                Pick<Db.SoftwareReferentRow, "isExpert" | "serviceUrl" | "useCaseDescription">)[];
            instances: (Instance & { addedByAgentEmail: string })[];
        };
    }

    export type Instance = {
        id: number;
        organization: string;
        targetAudience: string;
        publicUrl: string | undefined;
        otherWikidataSoftwares: Pick<SoftwareExternalData, "externalId" | "label" | "description">[];
    };
}

export function compiledDataPrivateToPublic(compiledData: CompiledData<"private">): CompiledData<"public"> {
    return compiledData.map((software): CompiledData.Software<"public"> => {
        const {
            referents,
            users,
            instances,
            annuaireCnllServiceProviders,
            catalogNumeriqueGouvFrId,
            categories,
            comptoirDuLibreSoftware,
            dereferencing,
            description,
            doRespectRgaa,
            generalInfoMd,
            id,
            isFromFrenchPublicService,
            isPresentInSupportContract,
            isStillInObservation,
            keywords,
            license,
            logoUrl,
            name,
            referencedSinceTime,
            softwareType,
            testUrls,
            latestVersion,
            updateTime,
            versionMin,
            workshopUrls,
            softwareExternalData,
            similarExternalSoftwares,
            parentWikidataSoftware,
            serviceProviders
        } = software;

        return {
            serviceProviders,
            annuaireCnllServiceProviders,
            catalogNumeriqueGouvFrId,
            categories,
            comptoirDuLibreSoftware,
            dereferencing,
            description,
            doRespectRgaa,
            generalInfoMd,
            id,
            isFromFrenchPublicService,
            isPresentInSupportContract,
            isStillInObservation,
            keywords,
            license,
            logoUrl,
            name,
            referencedSinceTime,
            softwareType,
            testUrls,
            latestVersion,
            updateTime,
            versionMin,
            workshopUrls,
            softwareExternalData,
            similarExternalSoftwares,
            parentWikidataSoftware,
            "hasExpertReferent": referents.find(({ isExpert }) => isExpert) !== undefined,
            "userAndReferentCountByOrganization": (() => {
                const out: CompiledData.Software.Public["userAndReferentCountByOrganization"] = {};

                referents.forEach(referent => {
                    const entry = (out[referent.organization] ??= { "referentCount": 0, "userCount": 0 });
                    entry.referentCount++;
                });
                users.forEach(user => {
                    const entry = (out[user.organization] ??= { "referentCount": 0, "userCount": 0 });
                    entry.userCount++;
                });

                return out;
            })(),
            "instances": instances.map(({ addedByAgentEmail, ...rest }) => rest)
        };
    });
}
