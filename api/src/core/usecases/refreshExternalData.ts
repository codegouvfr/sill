import { DatabaseRow } from "../adapters/dbApi/kysely/kysely.database";
import { wikidataSourceGateway } from "../adapters/wikidata";
import { halSourceGateway } from "../adapters/hal";
import { DbApiV2 } from "../ports/DbApiV2";
import type { GetSoftwareExternalData } from "../ports/GetSoftwareExternalData";
import { buildIndex } from "../utils";
import { SILL } from "../../types/SILL";

type ParamsOfrefreshExternalDataUseCase = {
    dbApi: DbApiV2;
    minuteSkipSince?: number;
};

const useCaseLogTitle = "[UC.refreshExternalData]";
const useCaseLogTimer = `${useCaseLogTitle} Finsihed fetching external data`;

export type FetchAndSaveExternalDataForAllSoftware = () => Promise<boolean>;
export type FetchAndSaveExternalDataForSoftware = (args: { softwareId: number }) => Promise<boolean>;

export const makeRefreshExternalDataAll: (
    params: ParamsOfrefreshExternalDataUseCase
) => FetchAndSaveExternalDataForAllSoftware = (params: ParamsOfrefreshExternalDataUseCase) => {
    const { dbApi, minuteSkipSince = 0 } = params;

    return async () => {
        console.time(useCaseLogTimer);
        const externalDataToUpdate = await dbApi.softwareExternalData.getIds({ minuteSkipSince });
        return refreshExternalDataByExternalIdAndSlug({ dbApi, ids: externalDataToUpdate });
    };
};

export const makeRefreshExternalDataForSoftware: (
    params: ParamsOfrefreshExternalDataUseCase
) => FetchAndSaveExternalDataForSoftware = (params: ParamsOfrefreshExternalDataUseCase) => {
    const { dbApi } = params;

    return async (args: { softwareId: number }) => {
        console.time(useCaseLogTimer);
        const { softwareId } = args;

        const externalDataBinded = await dbApi.softwareExternalData.getBySoftwareId({ softwareId });

        if (!externalDataBinded) {
            console.error(`${useCaseLogTitle} No external data found for this software`);
            return false;
        }

        const idsArray = externalDataBinded.map(externdalDataItem => ({
            externalId: externdalDataItem.externalId,
            sourceSlug: externdalDataItem.sourceSlug
        }));
        return refreshExternalDataByExternalIdAndSlug({ dbApi, ids: idsArray });
    };
};

const refreshExternalDataByExternalIdAndSlug = async (args: {
    dbApi: DbApiV2;
    ids: { externalId: string; sourceSlug: string }[];
}): Promise<boolean> => {
    const { dbApi, ids } = args;

    const sources = await dbApi.source.getAll();
    const sourceIndex: Record<string, DatabaseRow.SourceRow> = buildIndex({
        arrayOfObject: sources,
        fieldObject: "slug"
    });

    console.log(`[UC.refreshExternalData] ${ids.length} software to update`);

    for (const { sourceSlug, externalId } of ids) {
        console.time(`[UC.refreshExternalData] 💾 Update for ${externalId} on ${sourceSlug} : Done 💾`);
        console.log(`[UC.refreshExternalData] 🚀 Update for ${externalId} on ${sourceSlug} : Starting 🚀`);
        const source = sourceIndex[sourceSlug];

        const getCaller = getSoftwareExternalDataFunction(source.kind);
        const externalData = await getCaller({ externalId: externalId, source: source });

        if (externalData) {
            await dbApi.softwareExternalData.update({
                sourceSlug: source.slug,
                externalId: externalId,
                lastDataFetchAt: new Date().valueOf(),
                softwareExternalData: externalData
            });
        }
        console.timeEnd(`[UC.refreshExternalData] 💾 Update for ${externalId} on ${sourceSlug} : Done 💾`);
    }
    console.timeEnd(useCaseLogTimer);
    return true;
};

const getSoftwareExternalDataFunction = (sourceKind: SILL.SourceKind): GetSoftwareExternalData => {
    switch (sourceKind) {
        case "wikidata":
            return wikidataSourceGateway.softwareExternalData.getById;
        case "HAL":
            return halSourceGateway.softwareExternalData.getById;
        case "ComptoirDuLibre":
        case "FramaLibre":
        case "GitHub":
        case "GitLab":
        case "Orcid":
        case "SWH":
        case "doi":
            throw new Error("Not Implemented yet");
        default:
            const unreachableCase: never = sourceKind;
            throw new Error(`Unreachable case: ${unreachableCase}`);
    }
};
