import { getHalSoftwareOptions } from "./getHalSoftwareOptions";
import { getHalSoftwareExternalData } from "./getSoftwareExternalData";

export const halAdapter = {
    softwareExternalData: {
        getByHalId: getHalSoftwareExternalData
    },
    softwareOptions: {
        getByHalId: getHalSoftwareOptions
    }
};
