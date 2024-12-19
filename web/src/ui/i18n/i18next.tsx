import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import translationEn from "./sill_en.json";
import translationFr from "./sill_fr.json";

export const fallbackNS = "sill";
export const resources = {
  en: {
    sill: translationEn,
  },
  fr: {
    sill: translationFr
  }
} as const;

i18next
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    defaultNS: 'sill',
    fallbackNS: 'sill',

    interpolation: {
      escapeValue: false
    }
  });

  export default i18next;