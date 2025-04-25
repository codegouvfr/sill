import { assert } from "tsafe/assert";
import type { Equals } from "tsafe";

import { DbApiV2, WithAgentId } from "../ports/DbApiV2";
import { SoftwareFormData } from "./readWriteSillData";

export type UpdateSoftware = (
    params: {
        formData: SoftwareFormData;
        softwareId: number;
    } & WithAgentId
) => Promise<void>;

export const makeUpdateSoftware: (dbApi: DbApiV2) => UpdateSoftware =
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
            externalIdForSource, // TODO Remove
            sourceSlug, // TODO Remove
            comptoirDuLibreId, // TODO Remove
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
                keywords: softwareKeywords,
                externalIdForSource, // TODO Remove
                sourceSlug // TODO Remove
            },
            softwareId: softwareId
        });

        console.log(`software correctly updated, softwareId is : ${softwareId} (${softwareName})`);
    };
