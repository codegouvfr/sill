// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import { env } from "../env";
import { startImportService } from "../rpc/import";

startImportService(env).then(() => console.info("[Entrypoint:Import] Import sucessuful ✅ Closing import"));
