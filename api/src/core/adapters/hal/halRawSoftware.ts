import { Language } from "../../ports/GetSoftwareExternalData";
import { SoftwareExternalDataOption } from "../../ports/GetSoftwareExternalDataOptions";
import { SoftwareFormData, SoftwareType } from "../../usecases/readWriteSillData";
import { HalRawSoftware } from "./HalAPI/type";
import { parseBibliographicFields } from "./parseBibliographicFields";

const halSoftwareFieldsToReturn: (keyof HalRawSoftware)[] = [
    "en_abstract_s",
    "en_title_s",
    "fr_abstract_s",
    "fr_title_s",
    "docid",
    "uri_s",
    "openAccess_bool",
    "label_bibtex",
    "title_s",
    "abstract_s",
    "docType_s",
    "keyword_s",
    "softVersion_s",
    "softPlatform_s",
    "softCodeRepository_s",
    "authFullName_s",
    "authIdHal_s",
    "softProgrammingLanguage_s",
    "softVersion_s",
    "authIdForm_i",
    "domainAllCode_s",
    "modifiedDate_tdate"
];

export const halSoftwareFieldsToReturnAsString = halSoftwareFieldsToReturn.join(",");

export const rawHalSoftwareToExternalOption =
    (language: Language) =>
    (halSoftware: HalRawSoftware): SoftwareExternalDataOption => {
        const enLabel = halSoftware?.en_title_s?.[0] ?? halSoftware?.title_s?.[0] ?? "-";
        const labelByLang = {
            "en": enLabel,
            "fr": halSoftware?.fr_title_s?.[0] ?? enLabel
        };

        const enDescription = halSoftware?.en_abstract_s?.[0] ?? halSoftware.abstract_s?.[0] ?? "-";
        const descriptionByLang = {
            "en": enDescription,
            "fr": halSoftware?.fr_abstract_s?.[0] ?? enDescription
        };

        return {
            externalId: halSoftware.docid,
            label: labelByLang[language],
            description: descriptionByLang[language],
            isLibreSoftware: halSoftware.openAccess_bool,
            externalDataOrigin: "HAL"
        };
    };

const stringOfArrayIncluded = (stringArray: Array<string>, text: string): boolean => {
    return stringArray.some((arg: string) => {
        return text.includes(arg);
    });
};

const textToSoftwareType = (text: string): SoftwareType => {
    if (text.includes("docker")) {
        return {
            type: "cloud"
        };
    }

    const linux = stringOfArrayIncluded(["linux", "ubuntu", "unix", "multiplatform", "all"], text);
    const windows = stringOfArrayIncluded(["windows", "multiplatform", "all"], text);
    const mac = stringOfArrayIncluded(["mac", "unix", "multiplatform", "all"], text);

    const android = text.includes("android");
    const ios = stringOfArrayIncluded(["ios", "os x", "unix", "Multiplatform", "all"], text);

    return {
        type: "desktop/mobile",
        os: { "linux": linux, "windows": windows, "android": android, "ios": ios, "mac": mac }
    };
};

export const halRawSoftwareToSoftwareForm = (halSoftware: HalRawSoftware): SoftwareFormData => {
    const bibliographicReferences = parseBibliographicFields(halSoftware.label_bibtex);
    const license = bibliographicReferences?.license?.join(", ");

    const formData: SoftwareFormData = {
        softwareName: halSoftware.title_s[0],
        softwareDescription: halSoftware.abstract_s ? halSoftware.abstract_s[0] : "",
        softwareType: textToSoftwareType(
            halSoftware.softPlatform_s ? halSoftware.softPlatform_s.join("").toLocaleLowerCase() : ""
        ),
        externalId: halSoftware.docid,
        comptoirDuLibreId: undefined,
        softwareLicense: license || "copyright", // TODO 1 case to copyright
        softwareMinimalVersion: undefined,
        similarSoftwareExternalDataIds: [],
        softwareLogoUrl: undefined,
        softwareKeywords: halSoftware.keyword_s || [],

        isPresentInSupportContract: false,
        isFromFrenchPublicService: false,
        doRespectRgaa: null
    };

    return formData;
};
