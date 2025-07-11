// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import { SecondarySourceGateway } from "../../ports/SourceGateway";
import { getCNLLSoftwareExternalData } from "./getExternalData";

export const cnllSourceGateway: SecondarySourceGateway = {
    sourceType: "ComptoirDuLibre",
    sourceProfile: "Secondary",
    softwareExternalData: {
        getById: getCNLLSoftwareExternalData
    }
};
