import { DbApiV2 } from "../ports/DbApiV2";
import { SourceGateway } from "../ports/SourceGateway";
import { SoftwareFormData } from "./readWriteSillData";

export type CreateSoftwareFromForm = (softwareForm: SoftwareFormData, agentId: number) => Promise<number>;

export const makeCreateSoftwareFromForm = (dbApi: DbApiV2, externalDataService: SourceGateway) => {
    return async (softwareForm: SoftwareFormData, agentId: number) => {
        // Get or Create similars software Ids
        const similarSoftwareExternalDataIds = softwareForm.similarSoftwareExternalDataIds ?? [];
        const similarIds = await getOrPopulateFromIds({
            dbApi,
            externalDataService,
            similarSoftwareExternalDataIds,
            agentId
        });

        const actualSoft = await dbApi.software.getByName(softwareForm.softwareName);

        let softId: number;

        if (actualSoft && !actualSoft.referencedSinceTime) {
            // update soft to reference
            softId = actualSoft.softwareId;
            await dbApi.software.update({
                softwareSillId: softId,
                formData: softwareForm,
                agentId,
                isReferenced: true
            });
        } else {
            // Add the software
            softId = await dbApi.software.createByForm({
                formData: softwareForm,
                agentId,
                externalDataOrigin: externalDataService.sourceType,
                isReferenced: true
            });
        }

        console.log(`inserted software correctly, softwareId is : ${softId} (${softwareForm.softwareName})`);

        // Add the links
        if (similarIds.length > 0) {
            await dbApi.similarSoftware.create(
                similarIds.map(similarId => {
                    return {
                        softwareId: softId,
                        similarSoftwareId: similarId
                    };
                })
            );
        }

        return softId;
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
