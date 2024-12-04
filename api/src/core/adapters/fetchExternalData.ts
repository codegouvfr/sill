import type { ComptoirDuLibreApi } from "../ports/ComptoirDuLibreApi";
import { DbApiV2, OtherSoftwareExtraData } from "../ports/DbApiV2";
import type { GetCnllPrestatairesSill } from "../ports/GetCnllPrestatairesSill";
import { GetServiceProviders } from "../ports/GetServiceProviders";
import type { GetSoftwareExternalData, SoftwareExternalData } from "../ports/GetSoftwareExternalData";
import type { GetSoftwareLatestVersion } from "../ports/GetSoftwareLatestVersion";
import { Software } from "../usecases/readWriteSillData";
import { PgComptoirDuLibre } from "./dbApi/kysely/kysely.database";

type ExternalId = string;
type SoftwareExternalDataCacheBySoftwareId = Partial<Record<ExternalId, SoftwareExternalData | undefined>>;

type FetchOtherExternalDataDependencies = {
    getCnllPrestatairesSill: GetCnllPrestatairesSill;
    comptoirDuLibreApi: ComptoirDuLibreApi;
    getSoftwareLatestVersion: GetSoftwareLatestVersion;
    getServiceProviders: GetServiceProviders;
};

type FetchAndSaveSoftwareExtraDataDependencies = FetchOtherExternalDataDependencies & {
    getSoftwareExternalData: GetSoftwareExternalData;
    dbApi: DbApiV2;
};

export const makeFetchAndSaveSoftwareExtraData = ({
    getSoftwareExternalData,
    dbApi,
    ...otherExternalDataDeps
}: FetchAndSaveSoftwareExtraDataDependencies) => {
    const getOtherExternalData = makeGetOtherExternalData(otherExternalDataDeps);
    const getSoftwareExternalDataAndSaveIt = makeGetSoftwareExternalData({
        dbApi,
        getSoftwareExternalData
    });

    return async (softwareId: number, softwareExternalDataCache: SoftwareExternalDataCacheBySoftwareId) => {
        const data = await dbApi.software.getByIdWithLinkedSoftwaresExternalIds(softwareId);
        if (!data) return;

        const { software, similarSoftwaresExternalIds, parentSoftwareExternalId } = data;
        console.log(`🚀${software.softwareName}`);

        if (software.externalId) {
            console.log(" • Soft: ", software.softwareName, " - Own wiki : ", software.externalId);
            await getSoftwareExternalDataAndSaveIt(software.externalId, softwareExternalDataCache);
        }

        if (parentSoftwareExternalId) {
            console.log(" • Parent wiki : ", parentSoftwareExternalId);
            await getSoftwareExternalDataAndSaveIt(parentSoftwareExternalId, softwareExternalDataCache);
        }

        if (similarSoftwaresExternalIds.length > 0) {
            for (const similarExternalId of similarSoftwaresExternalIds) {
                console.log(" • Similar wiki : ", similarExternalId);
                await getSoftwareExternalDataAndSaveIt(similarExternalId, softwareExternalDataCache);
            }
        }

        const existingOtherSoftwareExtraData = await dbApi.otherSoftwareExtraData.getBySoftwareId(software.softwareId);
        const newOtherSoftwareExtraData = await getOtherExternalData(software, existingOtherSoftwareExtraData);

        if (newOtherSoftwareExtraData) await dbApi.otherSoftwareExtraData.save(newOtherSoftwareExtraData);
        await dbApi.software.updateLastExtraDataFetchAt({ softwareId: software.softwareId });
    };
};

const makeGetSoftwareExternalData =
    (deps: { getSoftwareExternalData: GetSoftwareExternalData; dbApi: DbApiV2 }) =>
    async (externalId: ExternalId, cache: SoftwareExternalDataCacheBySoftwareId) => {
        if (cache[externalId]) return cache[externalId];

        const softwareExternalData = await deps.getSoftwareExternalData(externalId);
        if (softwareExternalData) {
            await deps.dbApi.softwareExternalData.save(softwareExternalData);
            cache[externalId] = softwareExternalData;
        }
    };

const makeGetOtherExternalData =
    (deps: FetchOtherExternalDataDependencies) =>
    async (
        software: Software,
        existingOtherSoftwareExtraData: OtherSoftwareExtraData | undefined
    ): Promise<OtherSoftwareExtraData | undefined> => {
        const [serviceProvidersBySoftwareId, cnllPrestatairesSill, latestVersion] = await Promise.all([
            deps.getServiceProviders(),
            deps.getCnllPrestatairesSill(),
            software.codeRepositoryUrl ? deps.getSoftwareLatestVersion(software.codeRepositoryUrl, "quick") : undefined
        ]);

        const comptoirDuLibreSoftware = await getNewComptoirDuLibre({
            comptoirDuLibreApi: deps.comptoirDuLibreApi,
            software,
            otherSoftwareExtraDataInCache: existingOtherSoftwareExtraData
        });

        const otherSoftwareExtraData: OtherSoftwareExtraData = {
            softwareId: software.softwareId,
            serviceProviders:
                software.externalDataOrigin === "wikidata"
                    ? serviceProvidersBySoftwareId[software.softwareId.toString()] ?? []
                    : [],
            comptoirDuLibreSoftware,
            annuaireCnllServiceProviders:
                software.externalDataOrigin === "wikidata"
                    ? cnllPrestatairesSill
                          .find(({ sill_id }) => sill_id === software.softwareId)
                          ?.prestataires.map(({ nom, siren, url }) => ({
                              name: nom,
                              siren,
                              url
                          })) ?? null
                    : null,
            latestVersion: latestVersion ?? null
        };

        if (
            otherSoftwareExtraData.serviceProviders.length === 0 &&
            otherSoftwareExtraData.comptoirDuLibreSoftware === null &&
            otherSoftwareExtraData.annuaireCnllServiceProviders === null &&
            otherSoftwareExtraData.latestVersion === null
        )
            return;

        return otherSoftwareExtraData;
    };

const getNewComptoirDuLibre = async ({
    software,
    comptoirDuLibreApi,
    otherSoftwareExtraDataInCache
}: {
    comptoirDuLibreApi: ComptoirDuLibreApi;
    software: Software;
    otherSoftwareExtraDataInCache: OtherSoftwareExtraData | undefined;
}): Promise<PgComptoirDuLibre.Software | null> => {
    if (software.comptoirDuLibreId === undefined) return null;
    const comptoirDuLibre = await comptoirDuLibreApi.getComptoirDuLibre();
    const comptoirDuLibreSoftware = comptoirDuLibre.softwares.find(
        comptoirDuLibreSoftware => comptoirDuLibreSoftware.id === software.comptoirDuLibreId
    );

    if (!comptoirDuLibreSoftware) return null;

    const alreadySavedCdlSoftware = otherSoftwareExtraDataInCache?.comptoirDuLibreSoftware;

    const [logoUrl, keywords] =
        alreadySavedCdlSoftware && alreadySavedCdlSoftware.id === comptoirDuLibreSoftware.id
            ? [alreadySavedCdlSoftware.logoUrl, alreadySavedCdlSoftware.keywords]
            : await Promise.all([
                  comptoirDuLibreApi.getIconUrl({ comptoirDuLibreId: comptoirDuLibreSoftware.id }),
                  comptoirDuLibreApi.getKeywords({ comptoirDuLibreId: comptoirDuLibreSoftware.id })
              ]);

    return { ...comptoirDuLibreSoftware, logoUrl, keywords };
};

export type FetchAndSaveExternalDataForAllSoftwares = ReturnType<typeof makeFetchAndSaveExternalDataForAllSoftwares>;
export const makeFetchAndSaveExternalDataForAllSoftwares = (deps: FetchAndSaveSoftwareExtraDataDependencies) => {
    const fetchOtherExternalData = makeFetchAndSaveSoftwareExtraData(deps);
    return async () => {
        const softwares = await deps.dbApi.software.getAll({ onlyIfUpdatedMoreThan3HoursAgo: true });

        console.info(`About to update ${softwares.length} softwares`);

        const softwareExternalDataCache: SoftwareExternalDataCacheBySoftwareId = {};

        for (const software of softwares) {
            await fetchOtherExternalData(software.softwareId, softwareExternalDataCache);
        }
    };
};
