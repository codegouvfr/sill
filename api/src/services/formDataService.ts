import { DbApiV2 } from "../core/ports/DbApiV2";
import { SourceGateway } from "../core/ports/SourceGateway";
import { SoftwareFormData } from "../lib/ApiTypes";

export type FormDataService = {
    create: (softwareForm: SoftwareFormData, agentId: number) => Promise<number>;
};

export const formDataServiceMake = (dbApi: DbApiV2, externalDataService: SourceGateway) => {
    return {
        create: async (softwareForm: SoftwareFormData, agentId: number) => {
            // Get or Create similars software Ids
            const similarSoftwareExternalDataIds = softwareForm.similarSoftwareExternalDataIds ?? [];
            const similarIds = await getOrPopulateFromIds({
                dbApi,
                externalDataService,
                similarSoftwareExternalDataIds,
                agentId
            });

            // Add the software
            const newSoftId = await dbApi.software.createByForm({
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

export const getOrPopulateFromIds = async ({
    dbApi,
    externalDataService,
    similarSoftwareExternalDataIds,
    agentId
}: {
    dbApi: DbApiV2;
    externalDataService: SourceGateway;
    similarSoftwareExternalDataIds: string[];
    agentId: number;
}) => {
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
                    console.error("Not found on the source.");
                    return undefined;
                } else {
                    return await dbApi.software.createByForm({
                        formData: similarSoftwareForm,
                        externalDataOrigin: externalDataService.sourceType,
                        agentId,
                        isReferenced: false
                    });
                }
            }
        })
    );
    return similarIds.filter(val => {
        return val !== undefined;
    });
};
