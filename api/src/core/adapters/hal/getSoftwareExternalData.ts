import memoize from "memoizee";
import { GetSoftwareExternalData, SoftwareExternalData } from "../../ports/GetSoftwareExternalData";
import { fetchHalSoftwareById } from "./HalAPI/getHalSoftware";
import { halAPIGateway } from "./HalAPI";
import { HalFetchError } from "./HalAPI/type";

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
        const authors = codemetaSoftware?.author.map((auth) => {
            const author = auth.author;
            const id = author?.['@id']?.[0];

            let base = {
                "name": `${author.givenName} ${author.familyName}`,
                "id": id
            }

            if (id?.split('-')?.length === 4 && id?.length === 19) {
                return Object.assign({ 'url': `https://orcid.org/${id}` }, base);
            }

            if (id) {
                return Object.assign({ 'url': `https://hal.science/search/index/q/*/authIdHal_s/${id}` }, base);
            }

            return Object.assign({ 'url': `https://hal.science/search/index/q/*/authFullName_s/${author.givenName}+${author.familyName}` }, base);
        })

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
            license: codemetaSoftware?.license?.[0] ?? 'undefined',
            softwareVersion: halRawSoftware?.softVersion_s?.[0],
            keywords: halRawSoftware?.keyword_s,
            programmingLanguages: halRawSoftware?.softProgrammingLanguage_s,
            applicationCategories: sciencesCategories,
            publicationTime: halRawSoftware?.modifiedDate_tdate
                ? new Date(halRawSoftware?.modifiedDate_tdate)
                : undefined
        };
    },
    {
        "promise": true,
        "maxAge": 3 * 3600 * 1000
    }
);
