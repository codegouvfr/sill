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
}) => Promise<number[]>;

export const importFromSource: (dbApi: DbApiV2) => ImportFromSource = (dbApi: DbApiV2) => {
    return async ({ agentEmail, source, softwareIdOnSource }) => {
        const sourceGateway = resolveAdapterFromSource(source);

        if (sourceGateway.sourceProfile !== "Primary")
            throw new Error("Import if not possbile from a secondary source");

        const agent = await dbApi.agent.getByEmail(agentEmail);
        const agentId = agent
            ? agent.id
            : await dbApi.agent.add({
                  email: agentEmail,
                  "isPublic": false,
                  organization: "",
                  about: "This is a bot user created to import data."
              });

        const getSoftwareForm = sourceGateway.softwareForm.getById;
        let result = [];

        switch (source.kind) {
            case "HAL":
                // Get All or Request
                const rawHALSoftwareIds =
                    softwareIdOnSource && softwareIdOnSource.length > 0 && softwareIdOnSource[0] !== ""
                        ? softwareIdOnSource
                        : (await halAPIGateway.software.getAll({ SWHFilter: true })).map(doc => doc.docid);

                console.info(
                    `[UC:Import] Importing  ${rawHALSoftwareIds.length} software packages from ${source.slug}`
                );

                for (const docId of rawHALSoftwareIds) {
                    const newId = await checkSoftware(dbApi, source, docId, getSoftwareForm, agentId);
                    result.push(newId);
                }
                return Promise.resolve(result.filter(val => val != undefined));

            case "wikidata":
                if (!softwareIdOnSource || softwareIdOnSource.length === 0) {
                    return [];
                }

                console.info(
                    `[UC:Import] Importing  ${softwareIdOnSource.length} software packages from ${source.slug}`
                );

                for (const externalId of softwareIdOnSource) {
                    const newId = await checkSoftware(dbApi, source, externalId, getSoftwareForm, agentId);
                    result.push(newId);
                }
                return Promise.resolve(result.filter(val => val != undefined));

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
