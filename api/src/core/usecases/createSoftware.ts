// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import { assert } from "tsafe/assert";
import type { Equals } from "tsafe";

import { DbApiV2, WithAgentId } from "../ports/DbApiV2";
import { SoftwareFormData } from "./readWriteSillData";

export type CreateSoftware = (
    params: {
        formData: SoftwareFormData;
    } & WithAgentId
) => Promise<number>;

export const makeCreateSofware: (dbApi: DbApiV2) => CreateSoftware =
    (dbApi: DbApiV2) =>
    async ({ formData, agentId }) => {
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
            externalIdForSource,
            sourceSlug,
            comptoirDuLibreId,
            softwareKeywords,
            ...rest
        } = formData;

        assert<Equals<typeof rest, {}>>();

        const now = Date.now();

        const softwareId = await dbApi.software.create({
            software: {
                name: softwareName,
                description: softwareDescription,
                license: softwareLicense,
                logoUrl: softwareLogoUrl,
                versionMin: softwareMinimalVersion,
                referencedSinceTime: now,
                dereferencing: undefined,
                isStillInObservation: false,
                doRespectRgaa: doRespectRgaa ?? undefined,
                isFromFrenchPublicService: isFromFrenchPublicService,
                isPresentInSupportContract: isPresentInSupportContract,
                softwareType: softwareType,
                workshopUrls: [],
                categories: [],
                generalInfoMd: undefined,
                addedByAgentId: agentId,
                keywords: softwareKeywords,
                externalIdForSource, // TODO Remove
                sourceSlug // TODO Remove
            }
        });

        console.log(
            `inserted software correctly, softwareId is : ${softwareId} (${softwareName}), about to external identifiers : ${externalIdForSource} from ${sourceSlug}`
        );

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
            } else {
                await dbApi.softwareExternalData.insert([
                    {
                        externalId: externalIdForSource,
                        sourceSlug,
                        softwareId: softwareId
                    }
                ]);
            }
        }

        console.log(
            `inserted external identifiers correctly, softwareId is : ${softwareId} (${softwareName}), about to bind similars : `,
            similarSoftwareExternalDataIds
        );

        if (similarSoftwareExternalDataIds && similarSoftwareExternalDataIds.length > 0) {
            await dbApi.softwareExternalData.insert(
                similarSoftwareExternalDataIds.map(externalSimiliarId => ({
                    sourceSlug,
                    externalId: externalSimiliarId
                }))
            );
            await dbApi.similarSoftware.insert({
                softwareId,
                externalIds: similarSoftwareExternalDataIds.map(similarId => ({
                    externalId: similarId,
                    sourceSlug: sourceSlug
                }))
            });
        }

        console.log("all good");

        return softwareId;
    };
