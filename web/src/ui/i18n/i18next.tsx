// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import HttpApi from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { apiUrl } from "../../urls";

i18next
    .use(LanguageDetector)
    .use(HttpApi)
    .use(initReactI18next)
    .init({
        backend: {
            loadPath: `${apiUrl}/{{lng}}/translations.json`
        },
        supportedLngs: ["en", "fr"],
        fallbackLng: ["en", "fr"],
        interpolation: {
            escapeValue: false
        }
    });

export default i18next;
