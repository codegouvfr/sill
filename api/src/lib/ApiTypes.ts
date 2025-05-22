export type { ExternalDataOrigin } from "../core/ports/GetSoftwareExternalData";
export type { SoftwareExternalDataOption } from "../core/ports/GetSoftwareExternalDataOptions";
export type { GetSoftwareExternalDataOptions } from "../core/ports/GetSoftwareExternalDataOptions";
export type { Catalogi } from "../types/Catalogi";

export type {
    Agent,
    Instance,
    Os,
    Prerogative,
    Software,
    SoftwareFormData,
    DeclarationFormData,
    InstanceFormData,
    SoftwareType,
    ServiceProvider,
    Source
} from "../core/usecases/readWriteSillData";

export type { UiConfig, ConfigurableUseCaseName } from "../core/uiConfigSchema";

export type Translations = { translations: typeof import("../rpc/translations/en_default.json") };
