import memoize from "memoizee";
import fetch from "node-fetch";
import { id } from "tsafe/id";
import type { GetServiceProviders, ServiceProvidersBySillId } from "../ports/GetServiceProviders";
import { z } from "zod";
import { assert, type Equals } from "tsafe/assert";

type SillIdAndPrestataireFromApi = {
    sill_id: number;
    prestataires: {
        nom: string;
        website?: string;
        cdl_url?: string;
        cnll_url?: string;
        siren?: string;
    }[];
};

const zSillIdAndPrestataireFromApi = z.object({
    "sill_id": z.number(),
    "prestataires": z.array(
        z.object({
            "nom": z.string(),
            "website": z.string().optional(),
            "cdl_url": z.string().optional(),
            "cnll_url": z.string().optional(),
            "siren": z.string().optional()
        })
    )
});

assert<Equals<SillIdAndPrestataireFromApi, z.infer<typeof zSillIdAndPrestataireFromApi>>>();

const url = "https://code.gouv.fr/data/sill-prestataires.json";

export const getServiceProviders: GetServiceProviders = memoize(
    async () => {
        try {
            const res = await fetch(url);

            if (res.status !== 200) {
                throw new Error(`Failed to fetch ${url}`);
            }
            const json = await res.json();

            const serviceProvidersFromApi = z.array(zSillIdAndPrestataireFromApi).parse(json);

            return serviceProvidersFromApi.reduce(
                (acc, { sill_id, prestataires }) => ({
                    ...acc,
                    [sill_id]: prestataires.map(prestataire => ({
                        "name": prestataire.nom,
                        "website": prestataire.website,
                        "cdlUrl": prestataire.cdl_url,
                        "cnllUrl": prestataire.cnll_url,
                        "siren": prestataire.siren
                    }))
                }),
                id<ServiceProvidersBySillId>({})
            );
        } catch (error) {
            console.error(`Failed to fetch or parse ${url}: ${String(error)}`);
            return {};
        }
    },
    { "promise": true }
);
