import { ExternalDataOrigin, GetSoftwareExternalData } from "../ports/GetSoftwareExternalData";
import { GetSoftwareExternalDataOptions } from "../ports/GetSoftwareExternalDataOptions";
import { SoftwareFormData } from "../usecases/readWriteSillData";

export type Adapter = {
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
