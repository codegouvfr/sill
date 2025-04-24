import { DatabaseRow } from "../adapters/dbApi/kysely/kysely.database";
import { wikidataSourceGateway } from "../adapters/wikidata";
import { halSourceGateway } from "../adapters/hal";
import { DbApiV2 } from "../ports/DbApiV2";
import type { GetSoftwareExternalData } from "../ports/GetSoftwareExternalData";
import { buildIndex } from "../utils";
import { SILL } from "../../types/SILL";

type ParamsOfrefreshExternalDataUseCase = {
    dbApi: DbApiV2;
    githubPersonalAccessTokenForApiRateLimit: string;
    minuteSkipSince?: number;
};

export async function refreshExternalData(params: ParamsOfrefreshExternalDataUseCase): Promise<boolean> {
    console.time(`[UC.refreshExternalData] Finsihed fetching external data`);
    const { dbApi, minuteSkipSince } = params;

    const sources = await dbApi.source.getAll();
    const sourceIndex: Record<string, DatabaseRow.SourceRow> = buildIndex({
        arrayOfObject: sources,
        fieldObject: "slug"
    });

    const externalDataToUpdate = await dbApi.softwareExternalData.getIds({ minuteSkipSince });
    console.log(`[UC.refreshExternalData] ${externalDataToUpdate.length} software to update`);

    for (const { sourceSlug, externalId } of externalDataToUpdate) {
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
    console.timeEnd(`[UC.refreshExternalData] Finsihed fetching external data`);
    return true;
}

function getSoftwareExternalDataFunction(sourceKind: SILL.SourceKind): GetSoftwareExternalData {
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
}
