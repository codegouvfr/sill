import { DbApiV2 } from "../ports/DbApiV2";
import { halAPIGateway } from "../adapters/hal/HalAPI";
import { halRawSoftwareToSoftwareForm } from "../adapters/hal/getSoftwareForm";
import { getWikidataForm } from "../adapters/wikidata/getSoftwareForm";
import { formDataServiceMake } from "../../services/formDataService";
import { halAdapter } from "../adapters/hal";
import { wikidataAdapter } from "../adapters/wikidata";

export const importFromHALSource: (dbApi: DbApiV2) => (agentEmail: string) => Promise<Promise<number | undefined>[]> = (
    dbApi: DbApiV2
) => {
    return async (agentEmail: string) => {
        const formDataService = formDataServiceMake(dbApi, halAdapter);

        const agent = await dbApi.agent.getByEmail(agentEmail);
        const agentId = agent
            ? agent.id
            : await dbApi.agent.add({
                  email: agentEmail,
                  "isPublic": false,
                  organization: "",
                  about: "This is a bot user created to import data."
              });

        const softwares = await halAPIGateway.software.getAll({ SWHFilter: true });
        const dbSoftwares = await dbApi.software.getAll();
        const dbSoftwaresNames = dbSoftwares.map(software => {
            return software.softwareName;
        });

        return softwares.map(async software => {
            const index = dbSoftwaresNames.indexOf(software.title_s[0]);

            if (index != -1) {
                return dbSoftwares[index].softwareId;
            } else {
                console.info("Importing HAL : ", software.docid);
                const newSoftForm = await halRawSoftwareToSoftwareForm(software);
                return formDataService.create(newSoftForm, agentId);
            }
        });
    };
};

export const importFromWikidataSource: (
    dbApi: DbApiV2
) => (agentEmail: string, softwareIds: string[]) => Promise<Promise<number | undefined>[]> = (dbApi: DbApiV2) => {
    const formDataService = formDataServiceMake(dbApi, wikidataAdapter);

    return async (agentEmail: string, softwareIds: string[]) => {
        const agent = await dbApi.agent.getByEmail(agentEmail);
        const agentId = agent
            ? agent.id
            : await dbApi.agent.add({
                  email: agentEmail,
                  "isPublic": false,
                  organization: "",
                  about: "This is a bot user created to import data."
              });

        const dbSoftwares = await dbApi.software.getAll();
        const dbSoftwaresNames = dbSoftwares.map(software => {
            return software.softwareName;
        });

        return softwareIds.map(async (softwareId: string) => {
            const newSoftForm = await getWikidataForm(softwareId);
            if (!newSoftForm) {
                return -1;
            }

            const index = dbSoftwaresNames.indexOf(newSoftForm?.softwareName ?? "");

            if (index != -1) {
                return dbSoftwares[index].softwareId;
            } else {
                console.log("Importing wikidata : ", softwareId);
                return formDataService.create(newSoftForm, agentId);
            }
        });
    };
};
