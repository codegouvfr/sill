import type { FetchAndSaveExternalDataForAllSoftwares } from "../adapters/fetchExternalData";
import { CreateSoftwareFromForm } from "./createSoftwareFromForm";
import { GetAgent } from "./getAgent";
import type { GetSoftwareFormAutoFillDataFromExternalAndOtherSources } from "./getSoftwareFormAutoFillDataFromExternalAndOtherSources";

export type UseCases = {
    getSoftwareFormAutoFillDataFromExternalAndOtherSources: GetSoftwareFormAutoFillDataFromExternalAndOtherSources;
    fetchAndSaveExternalDataForAllSoftwares: FetchAndSaveExternalDataForAllSoftwares;
    getAgent: GetAgent;
    createSoftwareFromForm: CreateSoftwareFromForm;
};
