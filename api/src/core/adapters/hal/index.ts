import { getHalSoftwareOptions } from "./getHalSoftwareOptions";
import { getHalSoftwareExternalData } from "./getHalSoftwareExternalData";
import { getHalSoftwareForm } from "./getSoftwareForm";
import { SourceGateway } from "../../ports/SourceGateway";

export const halSourceGateway: SourceGateway = {
    sourceType: "HAL",
    softwareExternalData: {
        getById: getHalSoftwareExternalData
    },
    softwareOptions: {
        getById: getHalSoftwareOptions
    },
    softwareForm: {
        getById: getHalSoftwareForm
    }
};
