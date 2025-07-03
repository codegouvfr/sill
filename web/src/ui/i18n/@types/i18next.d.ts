// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import { ApiTypes } from "api";

declare module "i18next" {
    interface CustomTypeOptions {
        defaultNS: "translations";
        resources: ApiTypes.Translations;
    }
}
