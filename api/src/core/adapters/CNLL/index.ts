import { SecondarySourceGateway } from "../../ports/SourceGateway";
import { getCNLLSoftwareExternalData } from "./getExternalData";

export const cNLLSourceGateway: SecondarySourceGateway = {
    sourceType: "ComptoirDuLibre",
    sourceProfile: "Secondary",
    softwareExternalData: {
        getById: getCNLLSoftwareExternalData
    }
};
