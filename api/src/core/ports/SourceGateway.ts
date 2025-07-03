// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import { ExternalDataOrigin, GetSoftwareExternalData } from "./GetSoftwareExternalData";
import { GetSoftwareExternalDataOptions } from "./GetSoftwareExternalDataOptions";
import { GetSoftwareFormData } from "./GetSoftwareFormData";

export type SourceGateway = {
    sourceType: ExternalDataOrigin;
    softwareExternalData: {
        getById: GetSoftwareExternalData;
    };
    softwareOptions: {
        getById: GetSoftwareExternalDataOptions;
    };
    softwareForm: {
        getById: GetSoftwareFormData;
    };
};
