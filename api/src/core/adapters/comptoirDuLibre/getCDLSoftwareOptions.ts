import type {
    GetSoftwareExternalDataOptions,
    SoftwareExternalDataOption
} from "../../ports/GetSoftwareExternalDataOptions";
import { Language } from "../../ports/GetSoftwareExternalData";
import { Source } from "../../usecases/readWriteSillData";
import { comptoirDuLibreApi } from "../comptoirDuLibreApi";
import { ComptoirDuLibre } from "../../ports/ComptoirDuLibreApi";

export const rawCDLSoftwareToExternalOption =
    ({ source }: { language: Language; source: Source }) =>
    (cDLSoftware: ComptoirDuLibre.Software): SoftwareExternalDataOption => {
        return {
            externalId: cDLSoftware.id.toString(),
            label: cDLSoftware.name,
            description: "",
            isLibreSoftware: true,
            sourceSlug: source.slug
        };
    };

// HAL documentation is here : https://api.archives-ouvertes.fr/docs/search

export const getCDLSoftwareOptions: GetSoftwareExternalDataOptions = async ({ queryString, language, source }) => {
    if (source.kind !== "ComptoirDuLibre") throw new Error(`Not a Comptoir Du Libre source, was : ${source.kind}`);

    const comptoirAPi = await comptoirDuLibreApi.getComptoirDuLibre();
    const comptoirSoftware = comptoirAPi.softwares.filter(softwareItem => softwareItem.name.includes(queryString));

    if (!comptoirSoftware) return [];

    return comptoirSoftware.map(rawCDLSoftwareToExternalOption({ language, source }));
};
