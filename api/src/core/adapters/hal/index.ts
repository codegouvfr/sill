// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import { getHalSoftwareOptions } from "./getHalSoftwareOptions";
import { getHalSoftwareExternalData } from "./getHalSoftwareExternalData";
import { getHalSoftwareForm } from "./getSoftwareForm";
import { SourceGateway } from "../../ports/SourceGateway";

export const halSourceGateway: SourceGateway = {
    sourceType: "HAL",
    softwareExternalData: {
        getById: getHalSoftwareExternalData
    },
    softwareOptions: {
        getById: getHalSoftwareOptions
    },
    softwareForm: {
        getById: getHalSoftwareForm
    }
};
