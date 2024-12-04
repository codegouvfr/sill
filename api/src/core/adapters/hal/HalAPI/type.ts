export class HalFetchError extends Error {
    constructor(public readonly status: number | undefined) {
        super(`Hal fetch error status: ${status}`);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

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

export type HalAPIDomain = {
    docid: number;
    haveNext_bool: boolean;
    code_s: string;
    en_domain_s: string;
    fr_domain_s: string;
    label_s: string;
    _version_: number;
    dateLastIndexed_tdate: string; // ISO date
    level_i: number;
};
