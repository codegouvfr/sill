import { PrimarySourceGateway } from "../../ports/SourceGateway";
import { getZenodoExternalData } from "./getZenodoExternalData";
import { getZenodoSoftwareFormData } from "./getZenodoSoftwareForm";
import { getZenodoSoftwareOptions } from "./getZenodoSoftwareOptions";

export const zenodoSourceGateway: PrimarySourceGateway = {
    sourceType: "Zenodo",
    sourceProfile: "Primary",
    softwareExternalData: {
        getById: getZenodoExternalData
    },
    softwareOptions: {
        getById: getZenodoSoftwareOptions
    },
    softwareForm: {
        getById: getZenodoSoftwareFormData
    }
};
