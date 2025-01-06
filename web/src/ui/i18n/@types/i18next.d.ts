import { resources, fallbackNS } from "../i18next";

declare module "i18next" {
    interface CustomTypeOptions {
        defaultNS: typeof fallbackNS;
        resources: (typeof resources)["en"];
    }
}
