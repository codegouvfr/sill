// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import { assert } from "tsafe/assert";
import type { Equals } from "tsafe";

import { DbApiV2, WithAgentId } from "../ports/DbApiV2";
import { SoftwareFormData } from "./readWriteSillData";

export type Updateoftware = (
    params: {
        formData: SoftwareFormData;
        softwareId: number;
    } & WithAgentId
) => Promise<void>;

export const makeUpdateSoftware: (dbApi: DbApiV2) => Updateoftware =
    (dbApi: DbApiV2) =>
    async ({ formData, agentId, softwareId }) => {
        // Push in software
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

        await dbApi.software.update({
            software: {
                name: softwareName,
                description: softwareDescription,
                license: softwareLicense,
                logoUrl: softwareLogoUrl,
                versionMin: softwareMinimalVersion,
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
                keywords: softwareKeywords
            },
            softwareId: softwareId
        });

        console.log(`software correctly updated, softwareId is : ${softwareId} (${softwareName})`);
    };
