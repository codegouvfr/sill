import { SecondarySourceGateway } from "../../ports/SourceGateway";
import { getCNLLSoftwareExternalData } from "./getExternalData";

export const cnllSourceGateway: SecondarySourceGateway = {
    sourceType: "ComptoirDuLibre",
    sourceProfile: "Secondary",
    softwareExternalData: {
        getById: getCNLLSoftwareExternalData
    }
};
