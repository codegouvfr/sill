import { GetServiceProviders } from "../ports/GetServiceProviders";
import { ServiceProvidersBySillId } from "../usecases/serviceProviders";

type SillWithServiceProviderFromApi = {
    sill_id: number;
    prestataires: Array<{
        nom: string;
        website?: string;
        cdl_url?: string;
        url?: string;
        siren?: string;
    }>;
};
export const getServiceProviders: GetServiceProviders = () =>
    fetch("https://code.gouv.fr/data/sill-prestataires.json")
        .then(response => response.json())
        .then((serviceProvidersFromApi: SillWithServiceProviderFromApi[]) =>
            serviceProvidersFromApi.reduce(
                (acc, { sill_id, prestataires }) => ({
                    ...acc,
                    [sill_id]: prestataires.map(prestataire => ({
                        name: prestataire.nom,
                        website: prestataire.website,
                        cdlUrl: prestataire.cdl_url,
                        cnllUrl: prestataire.url,
                        siren: prestataire.siren
                    }))
                }),
                {} satisfies ServiceProvidersBySillId
            )
        );
