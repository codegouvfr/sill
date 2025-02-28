import type { SourceGateway } from "../core/ports/SourceGateway";
import { DbApiV2 } from "../core/ports/DbApiV2";
import { SoftwareFormData } from "../lib/ApiTypes";

export type FormDataService = {
    create: (softwareForm: SoftwareFormData, agentId: number) => Promise<number>;
};

export const formDataServiceMake = (dbApi: DbApiV2, externalDataService: SourceGateway) => {
    return {
        create: async (softwareForm: SoftwareFormData, agentId: number) => {
            // Get or Create similars software Ids
            const similarSoftwareExternalDataIds = softwareForm.similarSoftwareExternalDataIds ?? [];
            const similarIds = await Promise.all(
                similarSoftwareExternalDataIds.map(async similarSoftwareExternalDataId => {
                    const softwareId = await dbApi.software.getIdBySourceIdentifier(
                        externalDataService.sourceType,
                        similarSoftwareExternalDataId
                    );

                    if (softwareId) return softwareId;
                    else {
                        const similarSoftwareForm =
                            await externalDataService.softwareForm.getById(similarSoftwareExternalDataId);

                        if (!similarSoftwareForm) {
                            throw new Error("Not found on the source.");
                            // ingore instead of throw
                        }

                        const createdSoftwareId = await dbApi.software.create({
                            formData: similarSoftwareForm,
                            externalDataOrigin: externalDataService.sourceType,
                            agentId,
                            isReferenced: false
                        });

                        return createdSoftwareId;
                    }
                })
            );

            // Add the software
            const newSoftId = await dbApi.software.create({
                formData: softwareForm,
                agentId,
                externalDataOrigin: externalDataService.sourceType,
                isReferenced: true
            });

            console.log(`inserted software correctly, softwareId is : ${newSoftId} (${softwareForm.softwareName})`);

            // Add the links
            await dbApi.similarSoftware.create(
                similarIds.map(similarId => {
                    return {
                        softwareId: newSoftId,
                        similarSoftwareId: similarId
                    };
                })
            );

            return newSoftId;
        }
    };
};
