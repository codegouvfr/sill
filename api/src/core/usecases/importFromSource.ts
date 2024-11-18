import { DbApiV2 } from "../ports/DbApiV2";
import HAL from "../adapters/hal"
import { HalRawSoftwareToSoftwareForm } from "../adapters/hal/halRawSoftware";

export const importFromHALSource : (dbApi: DbApiV2) => (agentEmail: string) => Promise<Promise<number | undefined>[]> = (dbApi : DbApiV2)  => {
    return async (agentEmail: string) => {
        const agent = await dbApi.agent.getByEmail(agentEmail);
        const agentId = agent ? agent.id : await dbApi.agent.add({email: agentEmail, 'isPublic': false, organization: '', about: undefined});

        const softwares = await HAL.software.getAll();
        const softwareDb = await dbApi.software.getAll();
        const softwareDbNames = softwareDb.map((software) => {
            return software.softwareName;
        });

        return softwares.map(async software => {
            const newSoft = HalRawSoftwareToSoftwareForm(software);
            const index = softwareDbNames.indexOf(newSoft.softwareName);

            if (index != -1) {
                return Promise.resolve(softwareDb[index].id);
            } else {
                console.log('Importing HAL : ', software.docid);
                return dbApi.software.create({ formData: newSoft, externalDataOrigin: 'HAL', agentId: agentId });
            }
        });        
    }
}