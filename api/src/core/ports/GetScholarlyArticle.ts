// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import { ScholarlyArticle } from "../adapters/dbApi/kysely/kysely.database";

export type GetScholarlyArticle = (articleId: string) => Promise<ScholarlyArticle | undefined>;
