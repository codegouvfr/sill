import { DbApiV2 } from "../ports/DbApiV2";
import HAL from "../adapters/hal"
import { HalRawSoftwareToSoftwareForm } from "../adapters/hal/halRawSoftware";

export const feedDBfromHAL : any = (dbApi : DbApiV2)  => {
    return async () => {
        const softwares = await HAL.software.getAll();

        return softwares.map(async software => {
            const newSoft = HalRawSoftwareToSoftwareForm(software);
            const soft = await dbApi.software.getByName(newSoft.softwareName);
            if (soft) {
                return Promise.resolve(soft.id);
            } else {
                console.log('Importing HAL : ', software.docid);
                return dbApi.software.create({ formData: newSoft, externalDataOrigin: 'HAL', agentId: 1 }); // TODO agent id
            }
        });        
    }
}