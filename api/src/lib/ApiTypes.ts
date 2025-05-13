export type { SoftwareExternalDataOption } from "../core/ports/GetSoftwareExternalDataOptions";
export type { GetSoftwareExternalDataOptions } from "../core/ports/GetSoftwareExternalDataOptions";
export type { Catalogi } from "../types/Catalogi";

export type {
    ExternalDataOriginKind,
    SchemaIdentifier as Identifier,
    SchemaPerson as Person,
    SchemaOrganization as Organization,
    ScholarlyArticle
} from "../core/adapters/dbApi/kysely/kysely.database";

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
