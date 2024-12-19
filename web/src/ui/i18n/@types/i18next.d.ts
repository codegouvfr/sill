import { resources, fallbackNS } from "../i18next";

declare module "i18next" {
  interface CustomTypeOptions {
    fallbackNS: typeof fallbackNS;
    resources: typeof resources["en"];
  }
}