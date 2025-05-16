export type { ExternalDataOrigin } from "../core/ports/GetSoftwareExternalData";
export type { SoftwareExternalDataOption } from "../core/ports/GetSoftwareExternalDataOptions";
export type { GetSoftwareExternalDataOptions } from "../core/ports/GetSoftwareExternalDataOptions";
export type { SILL } from "../types/SILL";

export type {
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

export type Translations = { translations: typeof import("../customization/translations/en.json") };
