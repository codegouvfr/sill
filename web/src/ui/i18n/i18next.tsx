import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import translationEn from "./sill_en.json";
import translationFr from "./sill_fr.json";

export const fallbackNS = "sill";

// following is only for typechecking
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
const _isAssignable = (fr: typeof translationFr): typeof translationEn => fr;

export const resources = {
    en: { sill: translationEn },
    fr: { sill: translationFr }
} as const;

i18next
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        supportedLngs: ["en", "fr"],
        resources,
        fallbackLng: ["en", "fr"],
        defaultNS: "sill",
        fallbackNS: "sill",

        interpolation: {
            escapeValue: false
        }
    });

export default i18next;
