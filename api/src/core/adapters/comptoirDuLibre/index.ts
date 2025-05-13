// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import { getCDLSoftwareOptions } from "./getCDLSoftwareOptions";
import { getCDLSoftwareExternalData } from "./getCDLExternalData";
import { getCDLFormData } from "./getCDLFormData";
import { SourceGateway } from "../../ports/SourceGateway";

export const comptoirDuLibreSourceGateway: SourceGateway = {
    sourceType: "ComptoirDuLibre",
    softwareExternalData: {
        getById: getCDLSoftwareExternalData
    },
    softwareOptions: {
        getById: getCDLSoftwareOptions
    },
    softwareForm: {
        getById: getCDLFormData
    }
};
