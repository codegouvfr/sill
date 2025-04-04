import { getHalSoftwareOptions } from "./getHalSoftwareOptions";
import { getHalSoftwareExternalData } from "./getHalSoftwareExternalData";
import { getHalSoftwareForm } from "./getSoftwareForm";
import { SourceGateway } from "../../ports/SourceGateway";
import { getScholarlyArticle } from "./getScholarlyArticle";

type HALSourceGateway = SourceGateway;

export const halSourceGateway: HALSourceGateway = {
    sourceType: "HAL",
    softwareExternalData: {
        getById: getHalSoftwareExternalData
    },
    softwareOptions: {
        getById: getHalSoftwareOptions
    },
    softwareForm: {
        getById: getHalSoftwareForm
    },
    scholarlyArticle: {
        getById: getScholarlyArticle
    }
};
