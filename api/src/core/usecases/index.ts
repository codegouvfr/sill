// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import type {
    FetchAndSaveExternalDataForAllSoftware,
    FetchAndSaveExternalDataForSoftware
} from "./refreshExternalData";
import type { GetAgent } from "./getAgent";
import type { GetSoftwareFormAutoFillDataFromExternalAndOtherSources } from "./getSoftwareFormAutoFillDataFromExternalAndOtherSources";
import type { CreateSoftware } from "./createSoftware";
import type { UpdateSoftware } from "./updateSoftware";
import { ImportFromSource } from "./importFromSource";

export type UseCases = {
    getSoftwareFormAutoFillDataFromExternalAndOtherSources: GetSoftwareFormAutoFillDataFromExternalAndOtherSources;
    fetchAndSaveExternalDataForAllSoftware: FetchAndSaveExternalDataForAllSoftware;
    fetchAndSaveExternalDataForOneSoftwarePackage: FetchAndSaveExternalDataForSoftware;
    getAgent: GetAgent;
    importFromSource: ImportFromSource;
    createSoftware: CreateSoftware;
    updateSoftware: UpdateSoftware;
};
