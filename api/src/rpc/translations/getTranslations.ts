// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import translationEn from "../../customization/translations/en.json";
import translationFr from "../../customization/translations/fr.json";

import defaultTranslationsEn from "./en_default.json";
import defaultTranslationsFr from "./fr_default.json";

import merge from "deepmerge";

const _isAssignable = (fr: typeof translationFr): typeof translationEn => fr;
console.info(_isAssignable(translationFr) ? "isAssignable : true" : "isAssignable : false"); // this is just to avoid the TS error : _isAssignable is not used. TODO : use eslint rule instead (no eslint in backend for now)

export const getTranslations = (language: "fr" | "en") => {
    switch (language) {
        case "en":
            return merge(defaultTranslationsEn, translationEn);
        case "fr":
            return merge(defaultTranslationsFr, translationFr);
        default:
            language satisfies never;
            throw new Error(`Language ${language} not supported`);
    }
};
