import { getHalSoftware } from "./getSoftwareFromHal";

export const halAdapter = {
    softwareExternalData: {
        getByHalId: getHalSoftware
    }
};
