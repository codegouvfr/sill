import { DbApiV2 } from "../ports/DbApiV2";
import { halAPIGateway } from "../adapters/hal/HalAPI";
import { makeCreateSofware } from "./createSoftware";
import { Source } from "./readWriteSillData";
import { GetSoftwareFormData } from "../ports/GetSoftwareFormData";
import { resolveAdapterFromSource } from "../adapters/resolveAdapter";
import { makeZenodoApi } from "../adapters/zenodo/zenodoAPI";

export type ImportFromSource = (params: {
    agentEmail: string;
    source: Source;
    softwareIdOnSource?: string[];
}) => Promise<number[]>;

export const importFromSource: (dbApi: DbApiV2) => ImportFromSource = (dbApi: DbApiV2) => {
    return async ({ agentEmail, source, softwareIdOnSource }) => {
        const sourceGateway = resolveAdapterFromSource(source);

        if (sourceGateway.sourceProfile !== "Primary")
            throw new Error("[UC:Import] Import if not possible from a secondary source");

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

        const softwareIds =
            softwareIdOnSource && softwareIdOnSource.length > 0 && softwareIdOnSource[0] !== ""
                ? softwareIdOnSource
                : await resolveAllIdsAccordingToSource(source);

        console.info(`[UC:Import] Importing  ${softwareIds.length} software packages from ${source.slug}`);

        for (const externalId of softwareIds) {
            const newId = await checkSoftware(dbApi, source, externalId, getSoftwareForm, agentId);
            result.push(newId);
        }
        return result.filter(val => val != undefined);
    };
};

const resolveAllIdsAccordingToSource = async (source: Source): Promise<string[]> => {
    switch (source.kind) {
        case "HAL":
            return (await halAPIGateway.software.getAll({ SWHFilter: true })).map(doc => doc.docid);
        case "Zenodo":
            const zenodoAPI = makeZenodoApi();
            return (await zenodoAPI.records.getAllSoftware()).hits.hits.map(item => item.id.toString());
        case "ComptoirDuLibre":
        case "wikidata":
            throw new Error("[UC:Import] Not Implemented, but you can specify the list of ids you want to import");
        // Secondary Sources
        case "CNLL":
            throw new Error("[UC:Import] Import if not possible from a secondary source");
        default:
            const shouldNotBeReached: never = source.kind;
            throw new Error("[UC:Import] Not Implemented", shouldNotBeReached);
    }
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
