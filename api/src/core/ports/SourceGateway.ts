// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import { ExternalDataOriginKind } from "../adapters/dbApi/kysely/kysely.database";
import { GetSoftwareExternalData } from "./GetSoftwareExternalData";
import { GetSoftwareExternalDataOptions } from "./GetSoftwareExternalDataOptions";
import { GetSoftwareFormData } from "./GetSoftwareFormData";

export type SourceGateway = {
    sourceType: ExternalDataOriginKind;
    sourceProfile: "Primary" | "Secondary";
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

export type PrimarySourceGateway = SourceGateway & {
    sourceProfile: "Primary";
};

export type SecondarySourceGateway = Pick<SourceGateway, "sourceType" | "sourceProfile" | "softwareExternalData"> & {
    sourceProfile: "Secondary";
};
