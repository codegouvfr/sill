// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import type { FetchAndSaveExternalDataForAllSoftwares } from "../adapters/fetchExternalData";
import { GetAgent } from "./getAgent";
import type { GetSoftwareFormAutoFillDataFromExternalAndOtherSources } from "./getSoftwareFormAutoFillDataFromExternalAndOtherSources";

export type UseCases = {
    getSoftwareFormAutoFillDataFromExternalAndOtherSources: GetSoftwareFormAutoFillDataFromExternalAndOtherSources;
    fetchAndSaveExternalDataForAllSoftwares: FetchAndSaveExternalDataForAllSoftwares;
    getAgent: GetAgent;
};
