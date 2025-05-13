// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import { DbApiV2 } from "../ports/DbApiV2";
import { halAPIGateway } from "../adapters/hal/HalAPI";
import { makeCreateSofware } from "./createSoftware";
import { Source } from "./readWriteSillData";
import { GetSoftwareFormData } from "../ports/GetSoftwareFormData";
import { resolveAdapterFromSource } from "../adapters/resolveAdapter";

export type ImportFromSource = (params: {
    agentEmail: string;
    source: Source;
    softwareIdOnSource?: string[];
}) => Promise<Promise<number | undefined>[]>;

export const importFromSource: (dbApi: DbApiV2) => ImportFromSource = (dbApi: DbApiV2) => {
    return async ({ agentEmail, source, softwareIdOnSource }) => {
        const agent = await dbApi.agent.getByEmail(agentEmail);
        const agentId = agent
            ? agent.id
            : await dbApi.agent.add({
                  email: agentEmail,
                  "isPublic": false,
                  organization: "",
                  about: "This is a bot user created to import data."
              });

        const getSoftwareForm = resolveAdapterFromSource(source).softwareForm.getById;

        switch (source.kind) {
            case "HAL":
                // Get All or Request
                const rawHALSoftwareIds =
                    softwareIdOnSource && softwareIdOnSource.length > 0
                        ? softwareIdOnSource
                        : (await halAPIGateway.software.getAll({ SWHFilter: true })).map(doc => doc.docid);

                console.info(
                    `[UC:Import] Importing  ${rawHALSoftwareIds.length} software packages from ${source.slug}`
                );
                return rawHALSoftwareIds.map(docId => checkSoftware(dbApi, source, docId, getSoftwareForm, agentId));

            case "wikidata":
                if (!softwareIdOnSource || softwareIdOnSource.length === 0) {
                    return [];
                }

                console.info(
                    `[UC:Import] Importing  ${softwareIdOnSource.length} software packages from ${source.slug}`
                );
                return softwareIdOnSource
                    .map(externalId => checkSoftware(dbApi, source, externalId, getSoftwareForm, agentId))
                    .filter(val => val != undefined);
            default:
                throw Error("[UC:Import] Not Implemented");
        }
    };
};

const checkSoftware = async (
    dbApi: DbApiV2,
    source: Source,
    externalId: string,
    getSoftwareForm: GetSoftwareFormData,
    agentId: number
) => {
    // Check if already present
    const externalData = await dbApi.softwareExternalData.get({
        sourceSlug: source.slug,
        externalId: externalId
    });
    if (externalData) {
        console.info(`[UC:Import] Importing (${externalId}) from ${source.slug}: Already there ⏭️`);
        return externalData.softwareId;
    }

    // Get software form from source
    const softwareForm = await getSoftwareForm({ externalId, source });
    if (!softwareForm || !softwareForm.softwareName) {
        return undefined;
    }

    console.info(
        `[UC:Import] Importing ${softwareForm.softwareName}(${externalId}) from ${source.slug} : Adding software and externalData `
    );
    const createSoftware = makeCreateSofware(dbApi);
    return createSoftware({ formData: softwareForm, agentId: agentId });
};
