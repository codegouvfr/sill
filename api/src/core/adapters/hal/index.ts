import { getHalSoftwareOptions } from "./getHalSoftwareOptions";
import { getHalSoftwareExternalData } from "./getHalSoftwareExternalData";
import { getHalSoftwareForm } from "./getSoftwareForm";
import { PrimarySourceGateway } from "../../ports/SourceGateway";

export const halSourceGateway: PrimarySourceGateway = {
    sourceType: "HAL",
    sourceProfile: "Primary",
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
