import { ApiTypes } from "api";

declare module "i18next" {
    interface CustomTypeOptions {
        defaultNS: "translations";
        resources: ApiTypes.Translations;
    }
}
