import { Language, SoftwareExternalData } from "../../ports/GetSoftwareExternalData";
import { SoftwareExternalDataOption } from "../../ports/GetSoftwareExternalDataOptions";
import { SoftwareFormData, SoftwareType } from "../../usecases/readWriteSillData";
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

export const rawHalSoftwareToSoftwareExternalData = (halSoftware: HalRawSoftware): SoftwareExternalData => {
    const bibliographicReferences = parseBibliographicFields(halSoftware.label_bibtex);
    const license = bibliographicReferences?.license?.join(", ");

    return {
        externalId: halSoftware.docid,
        externalDataOrigin: "HAL",
        developers: halSoftware.authFullName_s.map((fullname, index) => {
            return {
                "id": halSoftware?.authIdHal_s?.[index] ?? halSoftware.authIdForm_i[index].toString(),
                "name": fullname
            };
        }),
        label: {
            "en": halSoftware?.en_title_s?.[0] ?? halSoftware?.title_s?.[0] ?? "-",
            "fr": halSoftware?.fr_title_s?.[0] ?? halSoftware.en_title_s?.[0] // TODO pourquoi en anglais et pas défault ?
        },
        description: {
            "en": halSoftware?.en_abstract_s?.[0] ?? halSoftware.abstract_s?.[0] ?? "-",
            "fr": halSoftware?.fr_abstract_s?.[0] ?? halSoftware.en_abstract_s?.[0] // TODO pourquoi en anglais et pas défault ?
        },
        isLibreSoftware: halSoftware.openAccess_bool,
        // Optionnal
        logoUrl: undefined,
        framaLibreId: undefined,
        websiteUrl: halSoftware.uri_s,
        sourceUrl: halSoftware?.softCodeRepository_s?.[0],
        documentationUrl: undefined, // TODO no info about documentation in HAL check on SWH or Repo ?
        license,
        softwareVersion: halSoftware?.softVersion_s?.[0],
        keywords: halSoftware?.keyword_s,
        programmingLanguages: halSoftware?.softProgrammingLanguage_s,
        applicationCategories: halSoftware?.domainAllCode_s,
        publicationTime: halSoftware?.modifiedDate_tdate ? new Date(halSoftware?.modifiedDate_tdate) : undefined
    };
};

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

export type HalRawSoftware = {
    // the following fields are the ones that we use
    docid: string;
    title_s: string[];
    en_title_s?: string[];
    fr_title_s?: string[];
    abstract_s?: string[];
    en_abstract_s?: string[];
    fr_abstract_s?: string[];
    uri_s: string;
    openAccess_bool: boolean;
    docType_s: string;
    label_bibtex: string;

    // The following is the complete list of fields that could be returned by the HAL API

    // label_s: string;
    // citationRef_s: string;
    // citationFull_s: string;
    // label_endnote: string;
    // label_coins: string;
    domainAllCode_s: string[];
    // level0_domain_s: string[];
    // domain_s: string[];
    // level1_domain_s: string[];
    // fr_domainAllCodeLabel_fs?: string[];
    // en_domainAllCodeLabel_fs?: string[];
    // es_domainAllCodeLabel_fs: string[];
    // eu_domainAllCodeLabel_fs: string[];
    // primaryDomain_s: string;
    // en_keyword_s?: string[];
    keyword_s: string[];
    // fr_keyword_s?: string[];
    // authIdFormPerson_s: string[];
    authIdForm_i: number[];
    // authLastName_s: string[];
    // authFirstName_s: string[];
    // authMiddleName_s: string[];
    authFullName_s: string[];
    // authLastNameFirstName_s: string[];
    // authIdLastNameFirstName_fs: string[];
    // authFullNameIdFormPerson_fs: string[];
    // authAlphaLastNameFirstNameId_fs: string[];
    // authIdFullName_fs: string[];
    // authFullNameId_fs: string[];
    // authQuality_s: string[];
    // authFullNameFormIDPersonIDIDHal_fs: string[];
    // authFullNamePersonIDIDHal_fs: string[];
    // authIdHalFullName_fs: string[];
    // authFullNameIdHal_fs: string[];
    // authAlphaLastNameFirstNameIdHal_fs: string[];
    // authLastNameFirstNameIdHalPersonid_fs: string[];
    // authIdHasPrimaryStructure_fs: string[];
    authIdHal_s: string[];
    // structPrimaryHasAuthId_fs: string[];
    // structPrimaryHasAuthIdHal_fs: string[];
    // structPrimaryHasAlphaAuthId_fs: string[];
    // structPrimaryHasAlphaAuthIdHal_fs: string[];
    // structPrimaryHasAlphaAuthIdHalPersonid_fs: string[];
    // authIdHasStructure_fs: string[];
    // structHasAuthId_fs: string[];
    // structHasAuthIdHal_fs: string[];
    // structHasAuthIdHalPersonid_s: string[];
    // structHasAlphaAuthId_fs: string[];
    // structHasAlphaAuthIdHal_fs: string[];
    // structHasAlphaAuthIdHalPersonid_fs: string[];
    // instStructId_i: number[];
    // instStructIdName_fs: string[];
    // instStructNameId_fs: string[];
    // instStructName_fs: string[];
    // instStructName_s: string[];
    // instStructAddress_s: string;
    // instStructCountry_s: string;
    // instStructType_s: string;
    // instStructValid_s: string;
    // structId_i: number[];
    // structIdName_fs: string[];
    // structNameId_fs: string[];
    // structName_fs: string[];
    // structName_s: string;
    // structAddress_s: string;
    // structCountry_s: string;
    // structType_s: string;
    // structValid_s: string;
    // contributorId_i: number;
    // contributorFullName_s: string;
    // contributorIdFullName_fs: string;
    // contributorFullNameId_fs: string;
    // language_s: string[];
    // halId_s: string;
    // version_i: number;
    // status_i: number;
    // instance_s: string;
    // sid_i: number;
    // submitType_s: string;
    // docSubType_s: string;
    // oldDocType_s: string;
    // thumbId_i: number;
    // selfArchiving_bool: boolean;
    // authorityInstitution_s: string[];
    // reportType_s: string;
    // inPress_bool: boolean;
    modifiedDate_tdate: string;
    // modifiedDate_s: string;
    // modifiedDateY_i: number;
    // modifiedDateM_i: number;
    // modifiedDateD_i: number;
    // submittedDate_tdate: string;
    // submittedDate_s: string;
    // submittedDateY_i: number;
    // submittedDateM_i: number;
    // submittedDateD_i: number;
    // releasedDate_tdate: string;
    // releasedDate_s: string;
    // releasedDateY_i: number;
    // releasedDateM_i: number;
    // releasedDateD_i: number;
    // producedDate_tdate: string;
    // producedDate_s: string;
    // producedDateY_i: number;
    // producedDateM_i: number;
    // producedDateD_i: number;
    // publicationDate_tdate: string;
    // publicationDate_s: string;
    // publicationDateY_i: number;
    // publicationDateM_i: number;
    // publicationDateD_i: number;
    // owners_i: number[];
    // collId_i: number[];
    // collName_s: string[];
    // collCode_s: string[];
    // collCategory_s: string[];
    // collIdName_fs: string[];
    // collNameId_fs: string[];
    // collCodeName_fs: string[];
    // collCategoryCodeName_fs: string[];
    // collNameCode_fs: string[];
    // fileMain_s: string;
    // files_s: string[];
    // fileType_s: string[];
    // _version_: bigint;
    // dateLastIndexed_tdate: string;
    // label_xml: string;
    softCodeRepository_s: string[];
    // softDevelopmentStatus_s: string[];
    softPlatform_s: string[];
    softProgrammingLanguage_s: string[];
    // softRuntimePlatform_s: string[];
    softVersion_s: string[];
    licence_s: string[];
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
        softwareMinimalVersion: halSoftware?.softVersion_s?.[0], // TODO not intended
        similarSoftwareExternalDataIds: [],
        softwareLogoUrl: undefined,
        softwareKeywords: halSoftware.keyword_s || [],

        isPresentInSupportContract: false,
        isFromFrenchPublicService: false, // TODO comment
        doRespectRgaa: null
    };

    return formData;
};
