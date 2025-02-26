import { Adapter } from "../core/adapters/type";
import { DbApiV2 } from "../core/ports/DbApiV2";
import { SoftwareFormData } from "../lib/ApiTypes";

export const makeSoftwareController = (dabaseService: DbApiV2, externalDataService: Adapter) => {
    return {
        createByFormData: async (softwareForm: SoftwareFormData, agentId: number) => {
            // Get or Create similars software Ids
            const similarSoftwareExternalDataIds = softwareForm.similarSoftwareExternalDataIds;
            const similarIds = await Promise.all(
                similarSoftwareExternalDataIds.map(async similarSoftwareExternalDataId => {
                    const softwareId = await dabaseService.software.getIdBySourceIdentifier(
                        externalDataService.sourceType,
                        similarSoftwareExternalDataId
                    );

                    if (softwareId) return softwareId.id;
                    else {
                        const similarSoftwareForm =
                            await externalDataService.softwareForm.getById(similarSoftwareExternalDataId);

                        if (!similarSoftwareForm) {
                            throw new Error("Not found on the source.");
                        }

                        const createdSoftwareId = await dabaseService.software.create({
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
            const newSoftId = await dabaseService.software.create({
                formData: softwareForm,
                agentId,
                externalDataOrigin: externalDataService.sourceType,
                isReferenced: true
            });

            // Add the links
            await dabaseService.software.registerSimilarSoftware({
                softwareId: newSoftId,
                similarSoftwareIds: similarIds
            });
        }
    };
};
