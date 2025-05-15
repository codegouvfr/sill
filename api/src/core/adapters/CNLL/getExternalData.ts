import memoize from "memoizee";

import { GetSoftwareExternalData, SoftwareExternalData } from "../../ports/GetSoftwareExternalData";
import { Source } from "../../usecases/readWriteSillData";
import { SchemaOrganization } from "../dbApi/kysely/kysely.database";
import { identifersUtils } from "../../utils";
import { getCnllPrestatairesSill } from "../getCnllPrestatairesSill";
import { CnllPrestatairesSill } from "../../ports/GetCnllPrestatairesSill";

export const getCNLLSoftwareExternalData: GetSoftwareExternalData = memoize(
    async ({
        externalId,
        source
    }: {
        externalId: string;
        source: Source;
    }): Promise<SoftwareExternalData | undefined> => {
        if (source.kind !== "CNLL") throw new Error("This source if not compatible with CNLL Adapter");

        const cNLLProviders = await getCnllPrestatairesSill();

        const providersForExternalId = cNLLProviders.find(element => element.sill_id.toString() === externalId);

        if (!providersForExternalId) return undefined;

        return formatCNLLProvidersToExternalData(providersForExternalId, source);
    }
);

const cNLLproviderToCMProdivers = (provider: CnllPrestatairesSill.Prestataire): SchemaOrganization => {
    return {
        "@type": "Organization" as const,
        name: provider.nom,
        url: provider.url ?? undefined,
        identifiers: [
            identifersUtils.makeSIRENIdentifier({
                SIREN: provider.siren,
                additionalType: "Organization"
            })
        ]
    };
};

const formatCNLLProvidersToExternalData = (
    cNLLProdivers: CnllPrestatairesSill,
    source: Source
): SoftwareExternalData => ({
    externalId: cNLLProdivers.sill_id.toString(),
    sourceSlug: source.slug,
    developers: [],
    label: { "fr": cNLLProdivers.nom },
    description: { "fr": "" },
    isLibreSoftware: true,
    logoUrl: undefined,
    websiteUrl: undefined,
    sourceUrl: undefined,
    documentationUrl: undefined,
    license: undefined,
    softwareVersion: undefined,
    keywords: [],
    programmingLanguages: [],
    applicationCategories: [],
    publicationTime: undefined,
    referencePublications: [],
    identifiers: [
        identifersUtils.makeCNLLIdentifier({
            cNNLId: cNLLProdivers.sill_id.toString()
        })
    ],
    providers: cNLLProdivers.prestataires.map(prodiver => cNLLproviderToCMProdivers(prodiver))
});
