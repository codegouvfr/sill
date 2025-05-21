import memoize from "memoizee";

import { GetSoftwareExternalData, SoftwareExternalData } from "../../ports/GetSoftwareExternalData";
import { Source } from "../../usecases/readWriteSillData";
import { SchemaPerson } from "../dbApi/kysely/kysely.database";
import { identifersUtils } from "../../../tools/identifiersTools";
import { makeZenodoApi } from "./zenodoAPI";
import { Zenodo } from "./zenodoAPI/type";

export const getZenodoExternalData: GetSoftwareExternalData = memoize(
    async ({
        externalId,
        source
    }: {
        externalId: string;
        source: Source;
    }): Promise<SoftwareExternalData | undefined> => {
        if (source.kind !== "Zenodo" && source.url !== "https://zenodo.org/")
            throw new Error(`Not a Zenodo source, was : ${source.kind}`);

        const zenodoApi = makeZenodoApi();
        const record = await zenodoApi.records.get(Number(externalId));

        if (!record) return undefined;
        if (record.metadata.resource_type.type !== "software")
            throw new TypeError(`The record corresponding at ${externalId} is not a software`);

        const communities = await zenodoApi.records.getCommunities(Number(externalId));

        return formatRecordToExternalData(record, communities.hits.hits, source);
    }
);

const creatorToPerson = (creator: Zenodo.Creator): SchemaPerson => {
    return {
        "@type": "Person" as const,
        name: creator.name,
        affiliations: creator.affiliation
            ? [
                  {
                      "@type": "Organization",
                      name: creator.affiliation
                  }
              ]
            : [],
        identifiers: [...(creator.orcid ? [identifersUtils.makeOrcidIdentifer({ orcidId: creator.orcid })] : [])]
    };
};

const formatRecordToExternalData = (
    recordSoftwareItem: Zenodo.Record,
    communities: Zenodo.Community[],
    source: Source
): SoftwareExternalData => {
    return {
        externalId: recordSoftwareItem.id.toString(),
        sourceSlug: source.slug,
        developers: recordSoftwareItem.metadata.creators.map(creatorToPerson),
        label: { "en": recordSoftwareItem.metadata.title },
        description: { "en": recordSoftwareItem.metadata.description },
        isLibreSoftware: recordSoftwareItem.metadata.access_right === "open", // Not sure
        logoUrl: undefined,
        websiteUrl: undefined,
        sourceUrl:
            recordSoftwareItem.metadata.related_identifiers?.filter(
                identifier => identifier.relation === "isSupplementTo"
            )?.[0]?.identifier ?? undefined,
        documentationUrl: undefined,
        license: recordSoftwareItem.metadata.license?.id ?? "Copyright",
        softwareVersion: recordSoftwareItem.metadata.version,
        keywords: recordSoftwareItem.metadata.keywords ?? [],
        programmingLanguages: recordSoftwareItem.metadata.custom?.["code:programmingLanguage"]?.map(
            item => item.title.en
        ),
        applicationCategories: communities?.map(commu => commu.metadata.title),
        publicationTime: recordSoftwareItem.metadata.publication_date,
        referencePublications: [], // TODO reliotated identifers // relation type // ??
        identifiers: [
            identifersUtils.makeZenodoIdentifer({
                zenodoId: recordSoftwareItem.id.toString(),
                url: `htpps://zenodo.org/records/${recordSoftwareItem.id.toString()}`,
                additionalType: "Software"
            }),
            ...(recordSoftwareItem.metadata.doi
                ? [identifersUtils.makeDOIIdentifier({ doi: recordSoftwareItem.metadata.doi })]
                : []),
            ...(recordSoftwareItem.swh.swhid
                ? [identifersUtils.makeSWHIdentifier({ swhId: recordSoftwareItem.swh.swhid })]
                : [])
        ],
        providers: []
    };
};
