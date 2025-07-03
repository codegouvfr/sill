// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import { env } from "../env";
import { startUpdateService } from "../rpc/update";

startUpdateService(env).then(() => process.exit(0));
