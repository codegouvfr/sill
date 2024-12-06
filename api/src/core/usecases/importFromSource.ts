import { DbApiV2 } from "../ports/DbApiV2";
import { halAPIGateway } from "../adapters/hal/HalAPI";
import { halRawSoftwareToSoftwareForm } from "../adapters/hal/getSoftwareForm";

export const importFromHALSource: (dbApi: DbApiV2) => (agentEmail: string) => Promise<Promise<number | undefined>[]> = (
    dbApi: DbApiV2
) => {
    return async (agentEmail: string) => {
        const agent = await dbApi.agent.getByEmail(agentEmail);
        const agentId = agent
            ? agent.id
            : await dbApi.agent.add({
                  email: agentEmail,
                  "isPublic": false,
                  organization: "",
                  about: "This is an bot user created to import data."
              });

        const softwares = await halAPIGateway.software.getAll();
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
                const newSoft = await halRawSoftwareToSoftwareForm(software);
                return dbApi.software.create({ formData: newSoft, externalDataOrigin: "HAL", agentId: agentId });
            }
        });
    };
};
