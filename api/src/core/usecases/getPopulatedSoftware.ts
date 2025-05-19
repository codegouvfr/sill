import { DatabaseDataType, DbApiV2, PopulatedExternalData } from "../ports/DbApiV2";
import { mergeObjects } from "../utils";
import { Software } from "./readWriteSillData";

export type MakeGetPopulatedSoftware = (dbApi: DbApiV2) => GetPopulatedSoftware;
export type GetPopulatedSoftware = () => Promise<Software[]>;

const dateParser = (str: string | Date | undefined | null) => {
    if (str && typeof str === "string") {
        const date = new Date(str);
        return date.valueOf();
    }
    if (str && str instanceof Date) {
        return str.valueOf();
    }
};

type MissingData = Pick<
    Software,
    | "userAndReferentCountByOrganization"
    | "comptoirDuLibreServiceProviderCount"
    | "annuaireCnllServiceProviders"
    | "comptoirDuLibreId"
    | "similarSoftwares"
>;

export const makeGetPopulatedSoftware: MakeGetPopulatedSoftware = (dbApi: DbApiV2) => async () => {
    const sofware = await dbApi.software.getAllO();

    const UIsofware = await Promise.all(
        sofware.map(async softwareItem => {
            const formatedSoftwareUI = formatSoftwareRowToUISoftware(softwareItem);

            const similarSoftwareIds = await dbApi.software.getSimilarSoftwareExternalDataPks({
                softwareId: softwareItem.id
            });
            console.log(similarSoftwareIds);
            // WIP : Either we point to an actual software or we compute a softwareUI from ExternalData

            const externalData = await dbApi.softwareExternalData.getPopulatedBySoftwareId({
                softwareId: softwareItem.id
            });
            if (!externalData || externalData.length === 0)
                throw new Error("Error in database, a software should have externalData");

            const mergedExternalDataItem = mergeExternalData(externalData);
            const mergedFormatedExternalDataItem = formatExternalDataRowToUISoftware(mergedExternalDataItem);

            const missingData: MissingData = {
                userAndReferentCountByOrganization: {},
                comptoirDuLibreServiceProviderCount: 0,
                annuaireCnllServiceProviders: undefined,
                comptoirDuLibreId: undefined,
                similarSoftwares: []
            };
            // TODO userAndReferentCountByOrganization: {},
            // TODO comptoirDuLibreServiceProviderCount: software.comptoirDuLibreSoftware?.providers.length ?? 0,
            // TODO annuaireCnllServiceProviders
            // TODO REMOVE comptoirDuLibreId
            // TODO similarSoftwares: similarExternalSoftwares,

            // TODO Which order ?
            const finalUISoftwareItem = Object.assign(formatedSoftwareUI, mergedFormatedExternalDataItem, missingData);
            return finalUISoftwareItem;
        })
    );

    return UIsofware;
};

type DataFromSofwareRow = Pick<
    Software,
    | "softwareId"
    | "softwareDescription"
    | "softwareName"
    | "updateTime"
    | "addedTime"
    | "logoUrl"
    | "applicationCategories"
    | "versionMin"
    | "license"
    | "keywords"
    | "softwareType"
    | "prerogatives"
    | "dereferencing"
    | "sourceSlug"
    | "externalId"
    | "comptoirDuLibreId"
>;
const formatSoftwareRowToUISoftware = (software: DatabaseDataType.SoftwareRow): DataFromSofwareRow => {
    return {
        softwareId: software.id,
        softwareDescription: software.description,
        softwareName: software.name,
        updateTime: new Date(+software.updateTime).getTime(),
        addedTime: new Date(+software.referencedSinceTime).getTime(),
        logoUrl: software.logoUrl,
        applicationCategories: software.categories,
        versionMin: software.versionMin,
        license: software.license,
        keywords: software.keywords,
        softwareType: software.softwareType,
        prerogatives: {
            isPresentInSupportContract: software.isPresentInSupportContract,
            isFromFrenchPublicServices: software.isFromFrenchPublicService,
            doRespectRgaa: software.doRespectRgaa ?? null
        },
        dereferencing: software.dereferencing,
        // TODO REMOVE
        sourceSlug: undefined,
        externalId: undefined,
        comptoirDuLibreId: undefined
    };
};

type DataFromExternalRow = Pick<
    Software,
    | "externalId"
    | "authors"
    | "officialWebsiteUrl"
    | "logoUrl"
    | "codeRepositoryUrl"
    | "documentationUrl"
    | "programmingLanguages"
    | "referencePublications"
    | "identifiers"
    | "license"
    | "applicationCategories"
    | "latestVersion"
    | "serviceProviders"
>;
const formatExternalDataRowToUISoftware = (
    externalDataRow: DatabaseDataType.SoftwareExternalDataRow
): DataFromExternalRow => {
    return {
        externalId: externalDataRow.externalId,
        authors: (externalDataRow.developers ?? []).map(dev => ({
            "@type": "Person",
            name: dev.name,
            url: dev.url,
            identifiers: dev.identifiers,
            affiliations: dev["@type"] === "Person" ? dev.affiliations : []
        })),
        officialWebsiteUrl: externalDataRow.websiteUrl,
        logoUrl: externalDataRow.logoUrl,
        codeRepositoryUrl: externalDataRow.sourceUrl,
        documentationUrl: externalDataRow.documentationUrl,
        programmingLanguages: externalDataRow.programmingLanguages ?? [],
        referencePublications: externalDataRow.referencePublications,
        identifiers: externalDataRow.identifiers,
        license: externalDataRow.license ?? "",
        applicationCategories: externalDataRow.applicationCategories ?? [],
        latestVersion: {
            semVer: externalDataRow.softwareVersion,
            publicationTime: dateParser(externalDataRow.publicationTime)
        },
        serviceProviders: externalDataRow.providers ?? []
    };
};

const mergeExternalData = (externalData: PopulatedExternalData[]) => {
    if (externalData.length === 0) throw Error("Nothing to merge, the array should be filled");
    if (externalData.length === 1) return stripExternalDataFromSource(externalData[0]);

    const [first, ...nexts] = externalData.sort((firstItem, secondItem) => secondItem.priority - firstItem.priority);

    const mergedItem = mergeObjects(first, nexts);

    return stripExternalDataFromSource(mergedItem);
};

const stripExternalDataFromSource = (
    populatedExternalDataItem: PopulatedExternalData
): DatabaseDataType.SoftwareExternalDataRow => {
    const { slug, priority, kind, url, ...externalDataItem } = populatedExternalDataItem;

    return externalDataItem;
};
