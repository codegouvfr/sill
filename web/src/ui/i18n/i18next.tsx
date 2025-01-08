import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import translationEn from "./sill_en.json";
import translationFr from "./sill_fr.json";
import cnrsEn from "./cnrs_en.json";
import cnrsFr from "./cnrs_fr.json";

export const fallbackNS = "sill";
export const resources = {
    en: {
        sill: translationEn,
        cnrs: cnrsEn
    },
    fr: {
        sill: translationFr,
        cnrs: cnrsFr
    }
} as const;

i18next.use(initReactI18next).init({
    resources,
    fallbackLng: ["fr", "en"],
    defaultNS: "cnrs",
    fallbackNS: "sill",

    interpolation: {
        escapeValue: false
    }
});

export default i18next;
