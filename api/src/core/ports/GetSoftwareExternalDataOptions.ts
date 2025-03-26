import { Source } from "../usecases/readWriteSillData";
import type { Language } from "./GetSoftwareExternalData";

export type SoftwareExternalDataOption = {
    externalId: string;
    label: string;
    description: string;
    isLibreSoftware: boolean;
    sourceSlug: string;
};

export type GetSoftwareExternalDataOptions = (params: {
    queryString: string;
    language: Language;
    source: Source;
}) => Promise<SoftwareExternalDataOption[]>;
