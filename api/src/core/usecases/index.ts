import type { FetchAndSaveExternalDataForAllSoftwares } from "../adapters/fetchExternalData";
import type { GetSoftwareFormAutoFillDataFromExternalAndOtherSources } from "./getSoftwareFormAutoFillDataFromExternalAndOtherSources";

export type UseCases = {
    getSoftwareFormAutoFillDataFromExternalAndOtherSources: GetSoftwareFormAutoFillDataFromExternalAndOtherSources;
    fetchAndSaveExternalDataForAllSoftwares: FetchAndSaveExternalDataForAllSoftwares;
};
