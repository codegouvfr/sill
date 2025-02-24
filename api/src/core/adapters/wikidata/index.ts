import { Adapter } from "../type";
import { getWikidataForm } from "./getSoftwareForm";
import { getWikidataSoftware } from "./getWikidataSoftware";
import { getWikidataSoftwareOptions } from "./getWikidataSoftwareOptions";

export const wikidataAdapter: Adapter = {
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
