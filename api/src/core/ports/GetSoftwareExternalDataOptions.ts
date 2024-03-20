import type { ExternalDataOrigin, Language } from "./GetSoftwareExternalData";

export type SoftwareExternalDataOption = {
    externalId: string;
    label: string;
    description: string;
    isLibreSoftware: boolean;
    externalDataOrigin: ExternalDataOrigin;
};

export type GetSoftwareExternalDataOptions = (params: {
    queryString: string;
    language: Language;
}) => Promise<SoftwareExternalDataOption[]>;
