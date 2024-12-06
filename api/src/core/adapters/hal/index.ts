import { getHalSoftwareOptions } from "./getHalSoftwareOptions";
import { getHalSoftwareExternalData } from "./getHalSoftwareExternalData";

export const halAdapter = {
    softwareExternalData: {
        getByHalId: getHalSoftwareExternalData
    },
    softwareOptions: {
        getByHalId: getHalSoftwareOptions
    }
};
