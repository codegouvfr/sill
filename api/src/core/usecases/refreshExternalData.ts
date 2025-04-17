// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import { DatabaseRow } from "../adapters/dbApi/kysely/kysely.database";
import { wikidataSourceGateway } from "../adapters/wikidata";
import { halSourceGateway } from "../adapters/hal";
import { DbApiV2 } from "../ports/DbApiV2";
import type { GetSoftwareExternalData } from "../ports/GetSoftwareExternalData";
import { buildIndex } from "../utils";
import { Catalogi } from "../../types/Catalogi";

type ParamsOfrefreshExternalDataUseCase = {
    dbApi: DbApiV2;
    skipSince?: number;
};

export async function refreshExternalData(params: ParamsOfrefreshExternalDataUseCase): Promise<boolean> {
    console.time(`[UC.refreshExternalData]Finsihed fetching external data`);
    const { dbApi, skipSince } = params;

    const sources = await dbApi.source.getAll();
    const sourceIndex: Record<string, DatabaseRow.SourceRow> = buildIndex({
        arrayOfObject: sources,
        fieldObject: "slug"
    });

    const externalDataToUpdate = await dbApi.softwareExternalData.getIds({ skipSince });
    console.log(`[UC.refreshExternalData] ${externalDataToUpdate.length} software to update`);

    for (const { sourceSlug, externalId } of externalDataToUpdate) {
        console.time(`💾[UC.refreshExternalData](${externalId} on ${sourceSlug}) : Done 💾`);
        console.log(`🚀[UC.refreshExternalData](${externalId} on ${sourceSlug}) : Starting 🚀`);
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
        console.timeEnd(`💾[UC.refreshExternalData](${externalId} on ${sourceSlug}) : Done 💾`);
    }
    console.timeEnd(`[UC.refreshExternalData]Finsihed fetching external data`);
    return true;
}

function getSoftwareExternalDataFunction(sourceKind: Catalogi.SourceKind): GetSoftwareExternalData {
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
