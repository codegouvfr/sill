// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import { Catalogi } from "../../types/Catalogi";

export type GetScholarlyArticle = (articleId: string) => Promise<Catalogi.ScholarlyArticle | undefined>;
