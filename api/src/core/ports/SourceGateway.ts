import { ExternalDataOriginKind } from "../adapters/dbApi/kysely/kysely.database";
import { GetSoftwareExternalData } from "./GetSoftwareExternalData";
import { GetSoftwareExternalDataOptions } from "./GetSoftwareExternalDataOptions";
import { GetSoftwareFormData } from "./GetSoftwareFormData";

export type BaseSourceGateway = {
    sourceProfile: "Primary" | "Secondary";
    sourceType: ExternalDataOriginKind;
    softwareExternalData: { getById: GetSoftwareExternalData };
};

export type PrimarySourceGateway = BaseSourceGateway & {
    sourceProfile: "Primary";
    softwareOptions: { getById: GetSoftwareExternalDataOptions };
    softwareForm: { getById: GetSoftwareFormData };
};

export type SecondarySourceGateway = BaseSourceGateway & {
    sourceProfile: "Secondary";
};
