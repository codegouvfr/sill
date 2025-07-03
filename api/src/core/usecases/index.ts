import type {
    FetchAndSaveExternalDataForAllSoftware,
    FetchAndSaveExternalDataForSoftware
} from "./refreshExternalData";
import type { GetAgent } from "./getAgent";
import type { GetSoftwareFormAutoFillDataFromExternalAndOtherSources } from "./getSoftwareFormAutoFillDataFromExternalAndOtherSources";
import type { CreateSoftware } from "./createSoftware";
import type { UpdateSoftware } from "./updateSoftware";
import { ImportFromSource } from "./importFromSource";
import { GetPopulatedSoftware } from "./getPopulatedSoftware";

export type UseCases = {
    getSoftwareFormAutoFillDataFromExternalAndOtherSources: GetSoftwareFormAutoFillDataFromExternalAndOtherSources;
    fetchAndSaveExternalDataForAllSoftware: FetchAndSaveExternalDataForAllSoftware;
    fetchAndSaveExternalDataForOneSoftwarePackage: FetchAndSaveExternalDataForSoftware;
    getAgent: GetAgent;
    importFromSource: ImportFromSource;
    createSoftware: CreateSoftware;
    updateSoftware: UpdateSoftware;
    getPopulateSoftware: GetPopulatedSoftware;
};
