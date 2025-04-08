import { SourceGateway } from "../../ports/SourceGateway";
import { getWikidataForm } from "./getSoftwareForm";
import { getWikidataSoftware } from "./getWikidataSoftware";
import { getWikidataSoftwareOptions } from "./getWikidataSoftwareOptions";

type WikidataSourceGateway = Pick<
    SourceGateway,
    "sourceType" | "softwareExternalData" | "softwareOptions" | "softwareForm"
>;

export const wikidataSourceGateway: WikidataSourceGateway = {
    sourceType: "wikidata",
    softwareExternalData: {
        getById: getWikidataSoftware
    },
    softwareOptions: {
        getById: getWikidataSoftwareOptions
    },
    softwareForm: {
        getById: getWikidataForm
    }
};
