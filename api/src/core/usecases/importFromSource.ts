import { DbApiV2 } from "../ports/DbApiV2";
import { halAPIGateway } from "../adapters/hal/HalAPI";
import { halRawSoftwareToSoftwareForm } from "../adapters/hal/getSoftwareForm";
import { getWikidataForm } from "../adapters/wikidata/getSoftwareForm";
import { makeCreateSofware } from "./createSoftware";
import { Source } from "./readWriteSillData";

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

        switch (source.kind) {
            case "HAL":
                // Get All or Request
                const rawHALSoftware =
                    softwareIdOnSource && softwareIdOnSource.length > 0
                        ? (await Promise.all(softwareIdOnSource.map(id => halAPIGateway.software.getById(id)))).filter(
                              a => a !== undefined
                          )
                        : await halAPIGateway.software.getAll({ SWHFilter: true });

                return rawHALSoftware.map(async rawHALSoftwareItem => {
                    // Check if already present in DB
                    const externalData = await dbApi.softwareExternalData.get({
                        externalId: rawHALSoftwareItem.docid,
                        sourceSlug: source.slug
                    });
                    if (externalData) {
                        console.info(
                            `[Import] Importing ${rawHALSoftwareItem.title_s[0]}(${rawHALSoftwareItem.docid}) from ${source.slug}: Already there`
                        );
                        return externalData.softwareId;
                    }

                    // Check if same name
                    const savedSoftware = await dbApi.software.getByName(rawHALSoftwareItem.title_s[0]);
                    if (savedSoftware) {
                        // Check if a external id exist for this source and name
                        const oldVersion = await dbApi.softwareExternalData.getBySoftwareIdAndSource({
                            softwareId: savedSoftware.softwareId,
                            sourceSlug: source.slug
                        });

                        if (oldVersion) {
                            // delete this old document and insert a new ! Careful on external Id similar
                            console.info(
                                `[UC:Import] Importing ${rawHALSoftwareItem.title_s[0]}(${rawHALSoftwareItem.docid}) from ${source.slug}: Need to delete and update`
                            );
                            console.log("should do smt");
                        }

                        // There is no document for this source, just insert the external data
                        console.info(
                            `[UC:Import] Importing ${rawHALSoftwareItem.title_s[0]}(${rawHALSoftwareItem.docid}) from ${source.slug}: Updating external data`
                        );
                        await dbApi.softwareExternalData.insert({
                            softwareId: savedSoftware.softwareId,
                            sourceSlug: source.slug,
                            externalId: rawHALSoftwareItem.docid
                        });

                        return savedSoftware.softwareId;
                    }

                    console.info(
                        `[UC:Import] Importing ${rawHALSoftwareItem.title_s[0]}(${rawHALSoftwareItem.docid}) from ${source.slug} `
                    );
                    const newSoft = await halRawSoftwareToSoftwareForm(rawHALSoftwareItem);
                    const createSoftware = makeCreateSofware(dbApi);
                    return createSoftware({ formData: newSoft, agentId: agentId });
                });
            case "wikidata":
                if (!softwareIdOnSource) {
                    return [];
                }

                return softwareIdOnSource
                    .map(async (wikidataId: string) => {
                        // Check if already present
                        const externalData = await dbApi.softwareExternalData.get({
                            sourceSlug: source.slug,
                            externalId: wikidataId
                        });
                        if (externalData) {
                            return externalData.softwareId;
                        }

                        // Get software
                        const wikidataSoftwareForm = await getWikidataForm(wikidataId);
                        if (!wikidataSoftwareForm || !wikidataSoftwareForm.softwareName) {
                            return undefined;
                        }

                        // Check if same name
                        const savedSoftware = await dbApi.software.getByName(wikidataSoftwareForm.softwareName);
                        if (savedSoftware) {
                            // Check if it's related to another source
                            const concurentExternalData = await dbApi.softwareExternalData.getBySoftwareIdAndSource({
                                sourceSlug: source.slug,
                                softwareId: savedSoftware.softwareId
                            });
                            if (concurentExternalData) {
                                // delete this old document and insert a new ! Careful on external Id similar
                                console.info(
                                    `[UC:Import] Importing ${wikidataSoftwareForm.softwareName}(${wikidataId}) from ${source.slug}: Need to delete and update`
                                );
                                console.log("should do smt");
                            }

                            await dbApi.softwareExternalData.insert({
                                softwareId: savedSoftware.softwareId,
                                sourceSlug: source.slug,
                                externalId: wikidataId
                            });

                            return savedSoftware.softwareId;
                        }

                        console.info(
                            `[UC:Import] Importing ${wikidataSoftwareForm.softwareName}(${wikidataId}) from ${source.slug} `
                        );
                        const createSoftware = makeCreateSofware(dbApi);
                        return createSoftware({ formData: wikidataSoftwareForm, agentId: agentId });
                    })
                    .filter(val => val != undefined);
            default:
                throw Error("[UC:Import] Not Implemented");
        }
    };
};
