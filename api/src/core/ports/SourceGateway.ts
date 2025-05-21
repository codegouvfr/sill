import { ExternalDataOriginKind } from "../adapters/dbApi/kysely/kysely.database";
import { GetSoftwareExternalData } from "./GetSoftwareExternalData";
import { GetSoftwareExternalDataOptions } from "./GetSoftwareExternalDataOptions";
import { GetSoftwareFormData } from "./GetSoftwareFormData";

export type SourceGateway = {
    sourceType: ExternalDataOriginKind;
    softwareExternalData: {
        getById: GetSoftwareExternalData;
    };
    softwareOptions: {
        getById: GetSoftwareExternalDataOptions;
    };
    softwareForm: {
        getById: GetSoftwareFormData;
    };
};
