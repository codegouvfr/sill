// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import { useTranslation } from "react-i18next";
import { MarkdownPage } from "ui/shared/MarkdownPage";

export default function Readme() {
    const { t } = useTranslation();

    return <MarkdownPage>{t("about.text")}</MarkdownPage>;
}
