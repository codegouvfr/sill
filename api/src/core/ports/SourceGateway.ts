import { ExternalDataOrigin, GetSoftwareExternalData } from "./GetSoftwareExternalData";
import { GetSoftwareExternalDataOptions } from "./GetSoftwareExternalDataOptions";
import { SoftwareFormData } from "../usecases/readWriteSillData";

export type SourceGateway = {
    sourceType: ExternalDataOrigin;
    softwareExternalData: {
        getById: GetSoftwareExternalData;
    };
    softwareOptions: {
        getById: GetSoftwareExternalDataOptions;
    };
    softwareForm: {
        getById: (externalId: string) => Promise<SoftwareFormData | undefined>;
    };
};
