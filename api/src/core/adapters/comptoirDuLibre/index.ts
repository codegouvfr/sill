import { getCDLSoftwareOptions } from "./getCDLSoftwareOptions";
import { getCDLSoftwareExternalData } from "./getCDLExternalData";
import { getCDLFormData } from "./getCDLFormData";
import { SourceGateway } from "../../ports/SourceGateway";

export const comptoirDuLibreSourceGateway: SourceGateway = {
    sourceType: "ComptoirDuLibre",
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
