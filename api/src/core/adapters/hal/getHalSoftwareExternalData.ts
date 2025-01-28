import memoize from "memoizee";
import { GetSoftwareExternalData, SoftwareExternalData } from "../../ports/GetSoftwareExternalData";
import { fetchHalSoftwareById } from "./HalAPI/getHalSoftware";
import { halAPIGateway } from "./HalAPI";
import { HalFetchError } from "./HalAPI/type";
import { SILL } from "../../../types/SILL";

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
                "url": structure?.ror_s ?? structure?.url_s,
                "parentOrganization": await buildParentOrganizationTree(structure?.parentDocid_i)
            };
        })
    );
};

export const getHalSoftwareExternalData: GetSoftwareExternalData = memoize(
    async (halDocId): Promise<SoftwareExternalData | undefined> => {
        const halRawSoftware = await fetchHalSoftwareById(halDocId).catch(error => {
            if (!(error instanceof HalFetchError)) throw error;
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
                    "affiliation": [] as SILL.Organization[]
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
                                    "url": structure.ror_s ?? structure?.url_s,
                                    "parentOrganization": await buildParentOrganizationTree(structure.parentDocid_i)
                                };
                            })
                    );
                    base.affiliation = structures;
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
            framaLibreId: undefined,
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
                : undefined
        };
    },
    {
        "promise": true,
        "maxAge": 3 * 3600 * 1000
    }
);
