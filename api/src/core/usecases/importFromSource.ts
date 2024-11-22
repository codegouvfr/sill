import { DbApiV2 } from "../ports/DbApiV2";
import { halAPIGateway } from "../adapters/hal";
import { halRawSoftwareToSoftwareForm } from "../adapters/hal/halRawSoftware";

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
            const newSoft = halRawSoftwareToSoftwareForm(software);
            const index = dbSoftwaresNames.indexOf(newSoft.softwareName);

            if (index != -1) {
                return dbSoftwares[index].softwareId;
            } else {
                console.log("Importing HAL : ", software.docid);
                return dbApi.software.create({ formData: newSoft, externalDataOrigin: "HAL", agentId: agentId });
            }
        });
    };
};
