// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import { env } from "../env";
import { startImportFromInnerIdentifersService } from "../rpc/import-from-inner-identifiers";

startImportFromInnerIdentifersService(env).then(() =>
    console.info(
        "[Entrypoint:Import-From-Inner-Identifiers] Import sucessuful ✅ Closing import from inner identifiers"
    )
);
