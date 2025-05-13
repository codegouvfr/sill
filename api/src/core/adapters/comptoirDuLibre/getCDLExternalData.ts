import memoize from "memoizee";

import { GetSoftwareExternalData, SoftwareExternalData } from "../../ports/GetSoftwareExternalData";
import { Source } from "../../usecases/readWriteSillData";
import { comptoirDuLibreApi } from "../comptoirDuLibreApi";
import { ComptoirDuLibre } from "../../ports/ComptoirDuLibreApi";
import { SchemaOrganization } from "../dbApi/kysely/kysely.database";
import { identifersUtils } from "../../utils";

export const getCDLSoftwareExternalData: GetSoftwareExternalData = memoize(
    async ({
        externalId,
        source
    }: {
        externalId: string;
        source: Source;
    }): Promise<SoftwareExternalData | undefined> => {
        const comptoirAPi = await comptoirDuLibreApi.getComptoirDuLibre();

        const comptoirSoftware = comptoirAPi.softwares.find(softwareItem => softwareItem.id.toString() === externalId);

        if (!comptoirSoftware) return undefined;

        return formatCDLSoftwareToExternalData(comptoirSoftware, source);
    }
);

const cDLproviderToCMProdivers = (provider: ComptoirDuLibre.Provider): SchemaOrganization => {
    return {
        "@type": "Organization" as const,
        name: provider.name,
        url: provider.external_resources.website ?? undefined,
        identifiers: [
            identifersUtils.makeCDLIdentifier({
                cdlId: provider.id.toString(),
                url: provider.url,
                additionalType: "Organization"
            })
        ]
    };
};

const formatCDLSoftwareToExternalData = (
    cDLSoftwareItem: ComptoirDuLibre.Software,
    source: Source
): SoftwareExternalData => {
    const splittedCNLLUrl = !Array.isArray(cDLSoftwareItem.external_resources.cnll)
        ? cDLSoftwareItem.external_resources.cnll.url.split("/")
        : undefined;

    return {
        externalId: cDLSoftwareItem.id.toString(),
        sourceSlug: source.slug,
        developers: [],
        label: { "fr": cDLSoftwareItem.name },
        description: { "fr": "" },
        isLibreSoftware: true,
        //
        logoUrl: undefined, // Use scrapper ?
        websiteUrl: cDLSoftwareItem.external_resources.website ?? undefined,
        sourceUrl: cDLSoftwareItem.external_resources.repository ?? undefined,
        documentationUrl: undefined,
        license: cDLSoftwareItem.licence,
        softwareVersion: undefined,
        keywords: [],
        programmingLanguages: [],
        applicationCategories: [],
        publicationTime: undefined,
        referencePublications: [],
        identifiers: [
            identifersUtils.makeCDLIdentifier({
                cdlId: cDLSoftwareItem.id.toString(),
                url: cDLSoftwareItem.url,
                additionalType: "Software"
            }),
            ...(!Array.isArray(cDLSoftwareItem.external_resources.cnll) && splittedCNLLUrl
                ? [
                      identifersUtils.makeCNLLIdentifier({
                          cNNLId: splittedCNLLUrl[splittedCNLLUrl.length - 1],
                          url: cDLSoftwareItem.external_resources.cnll.url
                      })
                  ]
                : []),
            ...(!Array.isArray(cDLSoftwareItem.external_resources.framalibre)
                ? [
                      identifersUtils.makeFramaIndentifier({
                          framaLibreId: cDLSoftwareItem.external_resources.framalibre.slug,
                          url: cDLSoftwareItem.external_resources.framalibre.url,
                          additionalType: "Software"
                      })
                  ]
                : []),
            ...(!Array.isArray(cDLSoftwareItem.external_resources.wikidata)
                ? [
                      identifersUtils.makeWikidataIdentifier({
                          wikidataId: cDLSoftwareItem.external_resources.wikidata.id,
                          url: cDLSoftwareItem.external_resources.wikidata.url,
                          additionalType: "Software"
                      })
                  ]
                : [])
        ],
        providers: cDLSoftwareItem.providers.map(prodiver => cDLproviderToCMProdivers(prodiver))
    };
};
