import memoize from "memoizee";
import { GetSoftwareExternalData, SoftwareExternalData } from "../../ports/GetSoftwareExternalData";
import { halAPIGateway } from "./HalAPI";
import { SILL } from "../../../types/SILL";
import { HAL } from "./HalAPI/types/HAL";

const buildParentOrganizationTree = async (
    structureIdArray: number[] | string[] | undefined
): Promise<SILL.Organization[]> => {
    if (!structureIdArray) return [];

    const IdsArray = structureIdArray.map(id => Number(id));

    return await Promise.all(
        IdsArray.map(async (structureId: number) => {
            const structure = await halAPIGateway.structure.getById(structureId);

            if (!structure) throw new Error(`Couldn't get data for structure docid : ${structureId}`);

            return {
                "@type": "Organization",
                "name": structure.name_s,
                "url": structure.ror_s?.[0] ?? structure.ror_s ?? structure?.url_s,
                "parentOrganizations": await buildParentOrganizationTree(structure?.parentDocid_i)
            };
        })
    );
};

const parseReferencePublication = (
    source: HAL.ArticleIdentifierOrigin,
    value: string | string[]
): SILL.ScholarlyArticle[] => {
    const arrayValue = typeof value === "string" ? value.split(",") : value;
    switch (source) {
        case "hal":
            return arrayValue.map((halThing): SILL.ScholarlyArticle => {
                return {
                    "@id": halThing,
                    "@type": "ScholarlyArticle",
                    identifier: {
                        "@type": "PropertyValue",
                        value: halThing,
                        propertyID: "HAL",
                        url: halThing.includes("https") ? new URL(halThing) : new URL(`https://hal.science/${halThing}`)
                    }
                };
            });
        case "doi":
            return arrayValue.map((doi): SILL.ScholarlyArticle => {
                return {
                    "@id": doi,
                    "@type": "ScholarlyArticle",
                    identifier: {
                        "@type": "PropertyValue",
                        value: doi,
                        propertyID: "doi",
                        url: doi.includes("https") ? URL.parse(doi) : URL.parse(`https://doi.org/${doi}`)
                    }
                };
            });
        case "arxiv":
            return arrayValue.map((arxivId): SILL.ScholarlyArticle => {
                return {
                    "@id": arxivId,
                    "@type": "ScholarlyArticle",
                    identifier: {
                        "@type": "PropertyValue",
                        value: arxivId,
                        propertyID: "arxiv",
                        url: arxivId.includes("https")
                            ? URL.parse(arxivId)
                            : URL.parse(`https://arxiv.org/abs/${arxivId}`)
                    }
                };
            });
        default:
            source satisfies never;
            return [];
    }
};

const codeMetaToReferencePublication = (HALReferencePublication: string[] | Object | undefined) => {
    if (HALReferencePublication) {
        if (Array.isArray(HALReferencePublication)) {
            console.error("Issue with HAL data. This data need to be curated", HALReferencePublication);
            return undefined;
        }

        return Object.entries(HALReferencePublication).reduce(
            (publicationArray: SILL.ScholarlyArticle[], [key, value]) => {
                return publicationArray.concat(parseReferencePublication(key as HAL.ArticleIdentifierOrigin, value));
            },
            []
        );
    }
    return undefined;
};

const HALSource: SILL.WebSite = {
    "@type": "Website" as const,
    name: "HAL instance",
    url: new URL("https://hal.science"),
    additionalType: "HAL"
};

const SWHSource: SILL.WebSite = {
    "@type": "Website" as const,
    name: "Software Heritage instance",
    url: new URL("https://www.softwareheritage.org/"),
    additionalType: "SWH"
};

const DOISource: SILL.WebSite = {
    "@type": "Website" as const,
    name: "DOI instance",
    url: new URL("https://www.doi.org"),
    additionalType: "doi"
};

export const getHalSoftwareExternalData: GetSoftwareExternalData = memoize(
    async (halDocId): Promise<SoftwareExternalData | undefined> => {
        const halRawSoftware = await halAPIGateway.software.getById(halDocId).catch(error => {
            if (!(error instanceof HAL.API.FetchError)) throw error;
            if (error.status === 404 || error.status === undefined) return;
            throw error;
        });

        if (halRawSoftware === undefined) return;
        if (halRawSoftware.docType_s !== "SOFTWARE") return;

        const sciencesCategories = await Promise.all(
            halRawSoftware.domainAllCode_s.map(async (code: string): Promise<string> => {
                const domain = await halAPIGateway.domain.getByCode(code);
                return domain.en_domain_s;
            })
        );

        const codemetaSoftware = await halAPIGateway.software.getCodemetaByUrl(halRawSoftware.uri_s);
        if (!codemetaSoftware) {
            throw Error(`No codemeta found for doc : ${halDocId}`);
        }

        const authors = await Promise.all(
            codemetaSoftware.author.map(async role => {
                const author = role.author;
                const id = author?.["@id"]?.[0];
                const affiliation = author.affiliation;

                const base: SILL.Person = {
                    "@type": "Person",
                    "name": `${author.givenName} ${author.familyName}`,
                    "identifier": id,
                    "affiliations": [] as SILL.Organization[]
                };

                if (affiliation?.length && affiliation.length > 0) {
                    const structures = await Promise.all(
                        affiliation
                            .filter(affilatiedStructure => affilatiedStructure.name)
                            .map(async affilatiedStructure => {
                                const structure = await halAPIGateway.structure.getByAcronym(affilatiedStructure?.name);
                                if (!structure) {
                                    throw new Error(`Structure not found : name = ${affilatiedStructure?.name}`);
                                }
                                return {
                                    "@type": "Organization" as const,
                                    "name": structure.name_s,
                                    "url": structure.ror_s?.[0] ?? structure.ror_s ?? structure?.url_s,
                                    "parentOrganizations": await buildParentOrganizationTree(structure.parentDocid_i)
                                };
                            })
                    );
                    base.affiliations = structures;
                }

                if (id?.split("-")?.length === 4 && id?.length === 19) {
                    return { ...base, "url": `https://orcid.org/${id}` };
                }

                if (id) {
                    return { ...base, "url": `https://hal.science/search/index/q/*/authIdHal_s/${id}` };
                }

                return {
                    ...base,
                    "url": `https://hal.science/search/index/q/*/authFullName_s/${author.givenName}+${author.familyName}`
                };
            })
        );

        const identifiers: SILL.Identification[] =
            codemetaSoftware?.identifier?.map(halIdentifier => {
                const base = {
                    "@type": "PropertyValue" as const,
                    value: halIdentifier.value,
                    url: new URL(halIdentifier.propertyID)
                };
                switch (halIdentifier["@type"]) {
                    case "hal":
                        return { ...base, subjectOf: HALSource };
                    case "swhid":
                        return { ...base, subjectOf: SWHSource };
                    case "doi":
                        return { ...base, subjectOf: DOISource };
                    case "bibcode":
                    case "cern":
                    case "prodinra":
                    case "arxiv":
                    case "biorxiv":
                    default:
                        return base;
                }
            }) ?? [];

        return {
            externalId: halRawSoftware.docid,
            externalDataOrigin: "HAL",
            developers: authors ?? [],
            label: {
                "en": halRawSoftware?.en_title_s?.[0] ?? halRawSoftware?.title_s?.[0] ?? "-",
                "fr": halRawSoftware?.fr_title_s?.[0] ?? halRawSoftware.en_title_s?.[0] // TODO pourquoi en anglais et pas défault ?
            },
            description: {
                "en": halRawSoftware?.en_abstract_s?.[0] ?? halRawSoftware.abstract_s?.[0] ?? "-",
                "fr": halRawSoftware?.fr_abstract_s?.[0] ?? halRawSoftware.en_abstract_s?.[0] // TODO pourquoi en anglais et pas défault ?
            },
            isLibreSoftware: halRawSoftware.openAccess_bool,
            // Optionnal
            logoUrl: undefined,
            websiteUrl: halRawSoftware.uri_s,
            sourceUrl: halRawSoftware?.softCodeRepository_s?.[0],
            documentationUrl: undefined, // TODO no info about documentation in HAL check on SWH or Repo ?
            license: codemetaSoftware?.license?.[0] ?? "undefined",
            softwareVersion: halRawSoftware?.softVersion_s?.[0],
            keywords: halRawSoftware?.keyword_s,
            programmingLanguages: halRawSoftware?.softProgrammingLanguage_s,
            applicationCategories: sciencesCategories,
            publicationTime: halRawSoftware?.releasedDate_tdate
                ? new Date(halRawSoftware?.releasedDate_tdate)
                : undefined,
            referencePublications: codeMetaToReferencePublication(codemetaSoftware.referencePublication),
            identifiers: identifiers
        };
    },
    {
        "promise": true,
        "maxAge": 3 * 3600 * 1000
    }
);
