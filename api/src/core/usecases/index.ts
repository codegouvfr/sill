import type { FetchAndSaveExternalDataForAllSoftware } from "./refreshExternalData";
import type { GetAgent } from "./getAgent";
import type { GetSoftwareFormAutoFillDataFromExternalAndOtherSources } from "./getSoftwareFormAutoFillDataFromExternalAndOtherSources";
import type { CreateSoftware } from "./createSoftware";
import type { UpdateSoftware } from "./updateSoftware";
import { ImportFromSource } from "./importFromSource";

export type UseCases = {
    getSoftwareFormAutoFillDataFromExternalAndOtherSources: GetSoftwareFormAutoFillDataFromExternalAndOtherSources;
    fetchAndSaveExternalDataForAllSoftware: FetchAndSaveExternalDataForAllSoftware;
    getAgent: GetAgent;
    importFromSource: ImportFromSource;
    createSoftware: CreateSoftware;
    updateSoftware: UpdateSoftware;
};
