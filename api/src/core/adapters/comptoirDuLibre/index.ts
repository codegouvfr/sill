import { getCDLSoftwareOptions } from "./getCDLSoftwareOptions";
import { getCDLSoftwareExternalData } from "./getCDLExternalData";
import { getCDLFormData } from "./getCDLFormData";
import { PrimarySourceGateway } from "../../ports/SourceGateway";

export const comptoirDuLibreSourceGateway: PrimarySourceGateway = {
    sourceType: "ComptoirDuLibre",
    sourceProfile: "Primary",
    softwareExternalData: {
        getById: getCDLSoftwareExternalData
    },
    softwareOptions: {
        getById: getCDLSoftwareOptions
    },
    softwareForm: {
        getById: getCDLFormData
    }
};
