// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import { PostgresDialect } from "kysely";
import { Pool } from "pg";

export const createPgDialect = (connectionString: string) =>
    new PostgresDialect({
        pool: new Pool({
            connectionString
        })
    });
