import memoize from "memoizee";
import { GetSoftwareExternalData, SoftwareExternalData } from "../../ports/GetSoftwareExternalData";
import { fetchHalSoftwareById } from "./HalAPI/getHalSoftware";
import { parseBibliographicFields } from "./parseBibliographicFields";
import { halAPIGateway } from "./HalAPI";
import { HalFetchError } from "./HalAPI/type";

export const getHalSoftware: GetSoftwareExternalData = memoize(
    async (halDocId): Promise<SoftwareExternalData | undefined> => {
        const halRawSoftware = await fetchHalSoftwareById(halDocId).catch(error => {
            if (!(error instanceof HalFetchError)) throw error;
            if (error.status === 404 || error.status === undefined) return;
            throw error;
        });

        if (halRawSoftware === undefined) return;
        if (halRawSoftware.docType_s !== "SOFTWARE") return;

        const bibliographicReferences = parseBibliographicFields(halRawSoftware.label_bibtex);
        const license = bibliographicReferences?.license?.join(", ");

        const sciencesCategories = await Promise.all(
            halRawSoftware.domainAllCode_s.map(async (code: string): Promise<string> => {
                const domain = await halAPIGateway.domain.getByCode(code);
                return domain.en_domain_s;
            })
        );

        return {
            externalId: halRawSoftware.docid,
            externalDataOrigin: "HAL",
            developers: halRawSoftware.authFullName_s.map((fullname: string, index: number) => {
                return {
                    "id": halRawSoftware?.authIdHal_s?.[index] ?? halRawSoftware.authIdForm_i[index].toString(),
                    "name": fullname
                };
            }),
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
            license,
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
