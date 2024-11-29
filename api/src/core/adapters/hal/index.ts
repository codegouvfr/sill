import { getHalSoftware } from "./getSoftwareFromHal";

export const halAdapter = {
    software: {
        getByHalId: getHalSoftware
    }
};
