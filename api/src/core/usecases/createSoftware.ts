// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import { DbApiV2, SoftwareExtrinsicCreation, WithAgentId } from "../ports/DbApiV2";
import { SoftwareFormData } from "./readWriteSillData";

export type CreateSoftware = (
    params: {
        formData: SoftwareFormData;
    } & WithAgentId
) => Promise<number>;

export const formDataToSoftwareRow = (softwareForm: SoftwareFormData, agentId: number): SoftwareExtrinsicCreation => ({
    name: softwareForm.softwareName,
    description: softwareForm.softwareDescription,
    license: softwareForm.softwareLicense,
    logoUrl: softwareForm.softwareLogoUrl,
    versionMin: softwareForm.softwareMinimalVersion,
    referencedSinceTime: Date.now(),
    dereferencing: undefined,
    isStillInObservation: false,
    doRespectRgaa: softwareForm.doRespectRgaa ?? undefined,
    isFromFrenchPublicService: softwareForm.isFromFrenchPublicService,
    isPresentInSupportContract: softwareForm.isPresentInSupportContract,
    softwareType: softwareForm.softwareType,
    workshopUrls: [],
    categories: [],
    generalInfoMd: undefined,
    addedByAgentId: agentId,
    keywords: softwareForm.softwareKeywords,
    externalIdForSource: softwareForm.externalIdForSource, // TODO Remove
    sourceSlug: softwareForm.sourceSlug // TODO Remove
});

const textUC = "CreateSoftware";

const resolveExistingSoftwareId = async ({
    dbApi,
    formData
}: {
    dbApi: DbApiV2;
    formData: SoftwareFormData;
}): Promise<number | undefined> => {
    const { softwareName, externalIdForSource, sourceSlug } = formData;
    const logTitle = `[UC:${textUC}] (${softwareName} from ${sourceSlug}) -`;

    const source = await dbApi.source.getByName({ name: sourceSlug });
    if (!source) throw new Error("Source slug is unknown");

    const named = await dbApi.software.getByName(softwareName);

    if (named) {
        console.log(logTitle, "Name already present, let's take this one");
        return named.softwareId;
    }

    if (externalIdForSource) {
        const savedSoftwareId = await dbApi.software.getSoftwareIdByExternalIdAndSlug({
            sourceSlug,
            externalId: externalIdForSource
        });
        if (savedSoftwareId) {
            console.log(logTitle, `External Id from ${sourceSlug} already present`);
            return savedSoftwareId;
        }
    }

    // Check if identifiers is saved in external data
    const savedIdentifers = await dbApi.softwareExternalData.getOtherIdentifierIdsBySourceURL({
        sourceURL: source.url
    });
    if (savedIdentifers && externalIdForSource && Object.hasOwn(savedIdentifers, externalIdForSource)) {
        // There is no externalId for this source, but it's already save and we know where !
        console.info(
            logTitle,
            ` Importing  ${softwareName}(${externalIdForSource}) from ${source.slug}: Adding externalData to software #${savedIdentifers[externalIdForSource]}`
        );
        await dbApi.softwareExternalData.saveIds([
            {
                softwareId: savedIdentifers[externalIdForSource],
                sourceSlug: source.slug,
                externalId: externalIdForSource
            }
        ]);

        return savedIdentifers[externalIdForSource];
    }

    return undefined;
};

const resolveOrCreateSoftwareId = async ({
    dbApi,
    formData,
    agentId
}: {
    dbApi: DbApiV2;
    formData: SoftwareFormData;
    agentId: number;
}) => {
    const { softwareName, sourceSlug } = formData;
    const logTitle = `[UC:${textUC}] (${softwareName} from ${sourceSlug}) -`;

    const resolvedId = await resolveExistingSoftwareId({ dbApi, formData });

    if (resolvedId) return resolvedId;

    console.log(logTitle, `The software package isn't save yet, let's create it`);
    return dbApi.software.create({
        software: formDataToSoftwareRow(formData, agentId)
    });
};

export const makeCreateSofware: (dbApi: DbApiV2) => CreateSoftware =
    (dbApi: DbApiV2) =>
    async ({ formData, agentId }) => {
        const { softwareName, similarSoftwareExternalDataIds, externalIdForSource, sourceSlug } = formData;
        const logTitle = `[UC:${textUC}] (${softwareName} from ${sourceSlug}) -`;

        console.time(`${logTitle} 💾 Saved`);

        const softwareId = await resolveOrCreateSoftwareId({ formData, agentId, dbApi });

        if (externalIdForSource) {
            const savedExternalData = await dbApi.softwareExternalData.get({
                sourceSlug,
                externalId: externalIdForSource
            });

            if (savedExternalData && savedExternalData.softwareId === undefined) {
                await dbApi.softwareExternalData.update({
                    sourceSlug,
                    externalId: externalIdForSource,
                    softwareId,
                    lastDataFetchAt: savedExternalData?.lastDataFetchAt,
                    softwareExternalData: savedExternalData
                });
                console.log(`${logTitle} 💾 ${externalIdForSource} now binded with this software`);
            }

            if (!savedExternalData) {
                await dbApi.softwareExternalData.saveIds([
                    {
                        externalId: externalIdForSource,
                        sourceSlug,
                        softwareId: softwareId
                    }
                ]);
                console.log(`${logTitle} 💾 ${externalIdForSource} now saved and binded with this software`);
            }

            // Do nothing when exist and already linked to software
        }

        if (similarSoftwareExternalDataIds && similarSoftwareExternalDataIds.length > 0) {
            // Add and update table if similar software
            await dbApi.softwareExternalData.saveIds(
                similarSoftwareExternalDataIds.map(externalSimiliarId => ({
                    sourceSlug,
                    externalId: externalSimiliarId
                }))
            );

            await dbApi.software.saveSimilarSoftwares([
                {
                    softwareId,
                    externalIds: similarSoftwareExternalDataIds.map(similarId => ({
                        externalId: similarId,
                        sourceSlug: sourceSlug
                    }))
                }
            ]);
            console.log(`${logTitle} 💾 Saved externalDataIds [${similarSoftwareExternalDataIds}]`);
        }

        console.timeEnd(`${logTitle} 💾 Saved`);
        return softwareId;
    };
