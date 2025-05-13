// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import { SoftwareFormData, Source } from "../usecases/readWriteSillData";

export type GetSoftwareFormData = (params: {
    externalId: string;
    source: Source;
}) => Promise<SoftwareFormData | undefined>;
