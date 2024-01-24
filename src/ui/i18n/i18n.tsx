import { createI18nApi, declareComponentKeys } from "i18nifty";
import { languages, type Language } from "@codegouvfr/sill";
import { assert } from "tsafe/assert";
import type { Equals } from "tsafe";
import { statefulObservableToStatefulEvt } from "powerhooks/tools/StatefulObservable/statefulObservableToStatefulEvt";
import { z } from "zod";
import { createUnionSchema } from "ui/tools/zod/createUnionSchema";
import { DeclarationType } from "../shared/DeclarationRemovalModal";

export { declareComponentKeys };
export { languages };
export type { Language };

export const fallbackLanguage = "en";

export type LocalizedString = Parameters<typeof resolveLocalizedString>[0];

const {
    useTranslation,
    resolveLocalizedString,
    useLang,
    $lang,
    useResolveLocalizedString
} = createI18nApi<
    | typeof import("ui/App").i18n
    | typeof import("ui/pages/softwareCatalog/SoftwareCatalogControlled").i18n
    | typeof import("ui/pages/softwareCatalog/SoftwareCatalogCard").i18n
    | typeof import("ui/pages/softwareCatalog/SoftwareCatalogSearch").i18n
    | typeof import("ui/pages/softwareDetails/SoftwareDetails").i18n
    | typeof import("ui/pages/softwareDetails/HeaderDetailCard").i18n
    | typeof import("ui/pages/softwareDetails/PreviewTab").i18n
    | typeof import("ui/pages/softwareDetails/ReferencedInstancesTab").i18n
    | typeof import("ui/pages/softwareDetails/AlikeSoftwareTab").i18n
    | typeof import("ui/pages/softwareDetails/CnllServiceProviderModal").i18n
    | typeof import("ui/pages/softwareUserAndReferent/SoftwareUserAndReferent").i18n
    | typeof import("ui/pages/declarationForm/DeclarationForm").i18n
    | typeof import("ui/pages/declarationForm/Step1").i18n
    | typeof import("ui/pages/declarationForm/Step2User").i18n
    | typeof import("ui/pages/declarationForm/Step2Referent").i18n
    | typeof import("ui/pages/home/Home").i18n
    | typeof import("ui/pages/addSoftwareLanding/AddSoftwareLanding").i18n
    | typeof import("ui/pages/softwareForm/SoftwareForm").i18n
    | typeof import("ui/pages/softwareForm/Step1").i18n
    | typeof import("ui/pages/softwareForm/Step2").i18n
    | typeof import("ui/pages/softwareForm/Step3").i18n
    | typeof import("ui/pages/softwareForm/Step4").i18n
    | typeof import("ui/pages/instanceForm/InstanceForm").i18n
    | typeof import("ui/pages/instanceForm/Step1").i18n
    | typeof import("ui/pages/instanceForm/Step2").i18n
    | typeof import("ui/pages/account/Account").i18n
    | typeof import("ui/pages/userProfile/UserProfile").i18n
    | typeof import("ui/shared/DetailUsersAndReferents").i18n
    | typeof import("ui/shared/Header").i18n
    | typeof import("ui/shared/Footer").i18n
    | typeof import("ui/shared/DeclarationRemovalModal").i18n
    | typeof import("ui/shared/SmartLogo").i18n
>()(
    { languages, fallbackLanguage },
    {
        "en": {
            "App": {
                "yes": "Yes",
                "no": "No",
                "not applicable": "Not applicable",
                "previous": "Previous",
                "next": "Next",
                "add software": "Add Software",
                "update software": "Update Software",
                "add software or service": "Add Software or Service",
                "add instance": "Add Instance",
                "update instance": "Update Instance",
                "required": "This field is required",
                "invalid url": 'Invalid URL. It must start with "http"',
                "invalid version": "The value must be numeric (e.g., 2.0.1)",
                "all": "All",
                "allFeminine": "All",
                "loading": "Loading...",
                "no result": "No results",
                "search": "Search",
                "validate": "Validate",
                "not provided": "Not provided"
            },
            "Home": {
                "title": ({ accentColor }) => (
                    <>
                        <span style={{ "color": accentColor }}>
                            Recommended free software
                        </span>{" "}
                        for French public agencies.
                    </>
                ),
                "software selection": "Software selections",
                "last added": "Recently added",
                "most used": "Most popular",
                "essential": "Essentials for your desktop or your mobile phone",
                "recently updated": "Recently updated",
                "waiting for referent": "Awaiting a referent",
                "in support market": "Support available",
                "SILL numbers": "The SILL in figures",
                "softwareCount": "referenced software",
                "registeredUserCount": "registered users",
                "agentReferentCount": "software referents",
                "organizationCount": "organizations",
                "help us": "You are a public servant? Help us enrich the catalog",
                "the sill in a few words": "The SILL in a nutshell",
                "the sill in a few words paragraph": ({ accentColor }) => (
                    <>
                        <p>
                            The Interministerial Free Software Catalog (SILL) is the
                            reference catalog of free software recommended by DINUM for
                            the French administration.
                        </p>
                        <p>
                            It is used to help administrations navigate and select the{" "}
                            <a
                                href="https://fr.wikipedia.org/wiki/Logiciel_libre"
                                style={{ "color": accentColor }}
                            >
                                free software
                            </a>{" "}
                            to use, in accordance with{" "}
                            <a
                                href="https://www.legifrance.gouv.fr/jorf/article_jo/JORFARTI000033203039"
                                style={{ "color": accentColor }}
                            >
                                Article 16 of the Digital Republic Act
                            </a>
                            .
                        </p>
                        <p>
                            The{" "}
                            <a
                                href="https://code.gouv.fr/sill/readme"
                                style={{ "color": accentColor }}
                            >
                                entry criteria
                            </a>{" "}
                            for software in the SILL include the publication of its source
                            code under an{" "}
                            <a
                                href="https://code.gouv.fr/fr/doc/licences-libres-dinum"
                                style={{ "color": accentColor }}
                            >
                                accepted free software license
                            </a>{" "}
                            and its deployment by a public institution or installation by
                            a public agent.
                        </p>
                        <p>
                            The SILL referents are public agents who volunteer to manage
                            and update information on the software included in the
                            catalog.
                        </p>
                    </>
                ),
                "illustration image": "Illustration image",
                "declare referent title": "Declare yourself as a referent",
                "edit software title": "Edit a software entry",
                "add software or service title": "Add a software or service",
                "declare referent desc":
                    "Become a volunteer public agent to manage and update information on SILL software",
                "edit software desc":
                    "Modify the information of an existing software in the SILL catalog",
                "add software or service desc":
                    "Propose a new software or service for inclusion in the SILL catalog",
                "declare referent button label": "Access the form",
                "edit software button label": "Search for software",
                "add software or service button label": "Complete the addition form"
            },
            "AddSoftwareLanding": {
                "title": (
                    <>
                        <span>Are you a public servant? </span> Add free software or
                        instances of free software used or deployed in your organization!
                    </>
                ),
                "subtitle":
                    "Contribute to the creation of a reference platform for public service software equipment and share valuable information with agents and CIOs in the administration",
                "who can add software": "Who can add software or a service, and how?",
                "discover as agent label": "Discover as an agent",
                "discover as agent description": (
                    <>
                        As a public agent, using the SILL (Interministerial Free Software
                        Catalog) offers several benefits.
                        <br />
                        Firstly, it simplifies the process of searching for and selecting
                        free software recommended by DINUM, ensuring the quality,
                        security, and compliance of tools used within the administration.
                        <br />
                        Moreover, the SILL encourages collaboration between public agents
                        from different public functions (State, Hospital, and
                        Territorial), fostering the exchange of experiences and best
                        practices.
                        <br />
                        By using software referenced in the SILL, public agents contribute
                        to the control, sustainability, and independence of their
                        administration's information systems, in accordance with Article
                        16 of the Digital Republic Act.
                        <br />
                        Lastly, by becoming a SILL referent for a free software, a public
                        agent can not only share their expertise and knowledge but also
                        benefit from the support and advice of the SILL referent community
                        and DINUM's free software mission.
                    </>
                ),
                "discover as DSI label": "Discover as CIO",
                "discover as DSI description": (
                    <>
                        As a Chief Information Officer (CIO), using the SILL offers
                        numerous advantages for managing and evolving your
                        administration's information systems.
                        <br />
                        The SILL streamlines the assessment and selection of free software
                        recommended by DINUM, thus ensuring compliance, quality, and
                        security of the implemented solutions.
                        <br />
                        Moreover, using software referenced in the SILL contributes to
                        strengthening the independence, control, and sustainability of
                        information systems, in line with the Digital Republic Act.
                        <br />
                        The SILL also allows benefiting from the shared experiences and
                        best practices of the SILL referent community and DINUM's free
                        software mission, fostering inter-administrative cooperation.
                        <br />
                        Furthermore, adopting free software can generate savings on
                        licensing and maintenance costs while encouraging innovation and
                        interoperability.
                        <br />
                        Ultimately, as a CIO, the SILL can help optimize the management of
                        IT resources and promote a culture of openness and collaboration
                        within the administration.
                    </>
                ),
                "contribute as agent label": "Contribute as agent",
                "contribute as agent description": (
                    <>
                        As a public official, contributing to the SILL allows you to add
                        value to the community by sharing your knowledge and facilitating
                        the adoption of open-source software within the administration.
                        <br />
                        Contributing mainly involves adding software and becoming a point
                        of reference for them.
                        <br />
                        By adding open-source software to the SILL, you help other public
                        servants discover reliable and high-performing solutions that meet
                        their needs.
                        <br />
                        Becoming a point of reference for a software allows you to attest
                        to its use within your administration, contribute to updating
                        relevant information about the software (minimum recommended
                        version, fact sheet, etc.), and agree to be contacted by other
                        public servants to discuss the software in question.
                        <br />
                        As a SILL point of reference, you can also subscribe to the SILL
                        maintainers' discussion list and participate in maintainers'
                        meetings, thereby strengthening cooperation and experience sharing
                        within the community of points of reference.
                        <br />
                        In short, contributing to the SILL as a public servant provides
                        you with the opportunity to develop your expertise, help your
                        colleagues, and promote the use of open-source software within the
                        administration.
                    </>
                ),
                "contribute as DSI label": "Contribute as CIO",
                "contribute as DSI description": (
                    <>
                        As a Director of Information Systems (CIO), contributing to the
                        SILL allows you to improve and support the free software ecosystem
                        within the administration, while sharing your expertise and
                        promoting innovation.
                        <br />
                        Contributing mainly involves adding software and becoming a
                        reference for them. By adding a free software to the SILL, you
                        help other administrations identify proven and effective solutions
                        that meet their needs, while strengthening interoperability and
                        inter-administrative collaboration.
                        <br />
                        Becoming a reference for a software allows you to attest to its
                        deployment within your administration, contribute to updating
                        relevant information about the software (recommended minimum
                        version, datasheet, etc.), and agree to be contacted by other
                        public agents to discuss the software in question.
                        <br />
                        As a SILL reference, you can also sign up for the SILL
                        maintainers' discussion list and participate in maintainers'
                        meetings, thus strengthening cooperation and experience sharing
                        within the community of references.
                        <br />
                        In short, contributing to the SILL as a CIO offers you the
                        opportunity to promote the use of free software, develop your
                        expertise, and encourage a culture of openness and collaboration
                        within the administration.
                    </>
                )
            },
            "SoftwareForm": {
                "stepper title": ({ currentStepIndex, softwareName, action }) => {
                    switch (currentStepIndex) {
                        case 1:
                            return (() => {
                                switch (action) {
                                    case "add":
                                        return softwareName === undefined
                                            ? "What type of software do you want to add?"
                                            : `What type of software is ${softwareName}?`;
                                    case "update":
                                        return `Modify the type of software of ${softwareName}`;
                                }
                            })();
                        case 2:
                            return `Information${
                                softwareName === undefined ? "" : ` about ${softwareName}`
                            }`;
                        case 3:
                            return `Prerequisites${
                                softwareName === undefined ? "" : ` of ${softwareName}`
                            }`;
                        case 4:
                            return `Similar and equivalent software${
                                softwareName === undefined ? "" : ` of ${softwareName}`
                            }`;
                        default:
                            return "";
                    }
                },
                "add software": ({ name }) =>
                    name === undefined ? "Add a software" : `Add ${name}`,
                "update software": ({ name }) => `Update ${name}`,
                "add software button": ({ name }) => `Add ${name} to the SILL`,
                "update software button": ({ name }) => `Update ${name}`
            },
            "SoftwareFormStep1": {
                "software desktop": "Desktop or mobile installable software",
                "software cloud": "Application software solution hosted in the cloud",
                "software cloud hint": "Public cloud or your organization's cloud",
                "module": "Brick or technical modules",
                "module hint": "For example proxies, HTTP servers or plugins",
                "checkbox legend":
                    "Operating system on which the software can be installed"
            },
            "SoftwareFormStep2": {
                "wikidata id": "Wikidata item",
                "wikidata id hint": ({
                    wikidataUrl,
                    exampleSoftwareName,
                    wikidataPageExampleUrl,
                    softwareSillUrl
                }) => (
                    <>
                        Fill up a name or directly the id (of the form <code>Qxxxxx</code>
                        ) to associate the software with an existing entry{" "}
                        <a href={wikidataUrl} target="_blank" rel="noreferrer">
                            Wikidata
                        </a>
                        .
                        <br />
                        Most general information, such as the logo or the URL of the code
                        repository, is extracted from Wikidata. If the software you want
                        to add does not have a Wikidata entry yet, you can create one .
                        Find here an{" "}
                        <a href={wikidataPageExampleUrl} target="_blank" rel="noreferrer">
                            example of a Wikidata entry
                        </a>
                        &nbsp; for the software&nbsp;
                        <a href={softwareSillUrl} target="_blank" rel="noreferrer">
                            {exampleSoftwareName}
                        </a>{" "}
                    </>
                ),
                "wikidata id information":
                    "This information will automatically populate other fields",
                "comptoir du libre id": "Comptoir du Libre identifier (optional)",
                "comptoir du libre id hint":
                    "If you the software is listed in the Comptoir du Libre you can add its identifier here. The identifier is either a numeric id or the url of the product page.",
                "software name": "Software name",
                "software feature": "Software function",
                "software feature hint":
                    "Describe in a few words the features of the software",
                "license": "Software license",
                "license hint": "(GNU, GPL, BSD, etc.)",
                "minimal version": "Minimum version",
                "minimal version hint":
                    "Earliest version still acceptable to have in production",
                "url or numeric id": "This field must be a URL or an ID number",
                "autofill notice":
                    "This information will automatically populate other fields",
                "logo url": "URL of the software logo",
                "logo url hint": "The url must Access-Control-Allow-Origin: * (CORS)",
                "must be an url": "Must be an URL",
                "keywords": "Keywords",
                "keywords hint":
                    "Keywords for making it pop up in the search results, coma separated",
                "logo preview alt": "Preview of the logo",
                "invalid comptoir du libre id":
                    "Comptoir du libre ID should be a numeric id or a comptoir du libre url"
            },
            "SoftwareFormStep3": {
                "is present in support market":
                    "Is the software present in the support market?",
                "is from french public service":
                    "Is the software developed by the French public service?",
                "do respect RGAA": "Is the software compliant with RGAA rules?"
            },
            "SoftwareFormStep4": {
                "similar software": "This software is an alternative to ...",
                "similar software hint":
                    "Associate the software with similar software, proprietary or not"
            },
            "InstanceForm": {
                "breadcrumb add instance": "Add instance",
                "breadcrumb update instance": "Update instance",
                "title add instance form": "Add software instance",
                "title update instance form": "Update software instance",
                "stepper title": ({ currentStepIndex }) => {
                    switch (currentStepIndex) {
                        case 1:
                            return "About the instantiated software";
                        case 2:
                            return "About the instance";
                        default:
                            return "";
                    }
                },
                "submit": "Add instance"
            },
            "InstanceFormStep1": {
                "software instance":
                    "What is the primary software used and deployed by your instance?",
                "other software": "Are there other software mobilized by your instance?"
            },
            "InstanceFormStep2": {
                "is in public access label": "Is your instance publicly accessible?*",
                "is in public access hint": "*Within the public service",
                "instance url label": "If so, what is the URL of the instance ?",
                "instance url hint":
                    "In order to offer quick access to the service offered",
                "organization label": "Which organization is involved?",
                "organization hint":
                    "What is the state organization that maintains this instance?",
                "targeted public label": "Who is the target audience?",
                "targeted public hint":
                    "Describe in a few words to whom the service offer is proposed"
            },
            "SoftwareCatalogControlled": {
                "search results": ({ count }) =>
                    `${count} free software${count === 1 ? "" : "s"}`,
                "sort by": "Sort by",
                "added_time": "Last added",
                "update_time": "Last updated",
                "referent_count": "Referent count",
                "referent_count_ASC": "Referent count ASC",
                "user_count": "User count",
                "user_count_ASC": "User count ASC",
                "latest_version_publication_date": "Last published version",
                "no software found": "No software found",
                "best_match": "Best match",
                "my_software": "My software"
            },
            "SoftwareCatalogCard": {
                "latest version": ({ fromNowText }) => `Latest version ${fromNowText}`,
                "declare oneself referent": "Declare yourself referent / user",
                "hasDesktopApp": "This software can be installed on a personal computer",
                "isFromFrenchPublicService":
                    "This software is from French public service",
                "isPresentInSupportMarket": "This software is present in support market",
                "you are user": "You're using it",
                "you are referent": "You are referent"
            },
            "SoftwareCatalogSearch": {
                "placeholder": "Search a software",
                "filtersButton": "Filters",
                "organizationLabel": "Organization",
                "categoriesLabel": "Categories",
                "environnement label": "Usage environnement ",
                "prerogativesLabel": "Prerogatives",
                "filters": "Filters",
                "isInstallableOnUserComputer": "Can be installed on user terminal",
                "isAvailableAsMobileApp": "Mobile application available",
                "isFromFrenchPublicServices": "Is from French public services",
                "doRespectRgaa": "Is compliant with RGAA rules",
                "isPresentInSupportContract": "Comes with possible support",
                "isTestable": "Is testable",
                "organization filter hint":
                    "Only show software that have at least one referent from a given organization",
                "linux": "GNU/Linux",
                "mac": "MacOS",
                "windows": "Windows",
                "browser": "Web browser",
                "stack": "Library, Framework and other technical building blocks",
                "number of prerogatives selected": ({ count }) =>
                    count === 0 ? "None" : `${count} selected`,
                "ios": "iOS (iPhone)",
                "android": "Android Smartphones"
            },
            "SoftwareDetails": {
                "catalog breadcrumb": "Software catalog",
                "tab title overview": "Overview",
                "tab title instance": ({ instanceCount }) =>
                    `Referenced instance (${instanceCount})`,
                "tab service providers": ({ serviceProvidersCount }) =>
                    `Service providers (${serviceProvidersCount})`,
                "tab title alike software": ({ alikeSoftwareCount }) =>
                    `Alike or equivalent proprietary software (${alikeSoftwareCount})`,
                "list of service providers": "List of service providers",
                "prerogatives": "Prerogatives",
                "last version": "Last version",
                "last version date": ({ date }) => `in ${date}`,
                "register": "Date de l'ajout : ",
                "register date": ({ date }) => `${date}`,
                "minimal version": "Minimal required version: ",
                "license": "License : ",
                "declare oneself referent": "Declare yourself referent / user",
                "hasDesktopApp": "Installable on agent computer",
                "isPresentInSupportMarket": "Present in support market",
                "isFromFrenchPublicService": "From French public service",
                "isRGAACompliant": "Is compliant with RGAA rules",
                "comptoire du libre sheet": "Open Comptoir du libre sheet",
                "wikiData sheet": "Open Wikidata sheet",
                "share software": "Share the software",
                "declare referent": "Declare yourself referent / user",
                "edit software": "Edit software",
                "stop being user/referent": ({ declarationType }) =>
                    `Stop being ${declarationTypeToEnglish[declarationType]}`,
                "become referent": "Become referent",
                "please provide a reason for unreferencing this software": `Please
                provide a reason why you think this software should not be in the SILL anymore`,
                "unreference software": "Dereference the software"
            },
            "HeaderDetailCard": {
                "authors": "Authors : ",
                "website": "Official website",
                "documentation": "Documentation",
                "repository": "Source code repository",
                "software logo": "Software logo",
                "you are user": "You're using it",
                "you are referent": "You are referent",
                "software dereferenced": ({
                    lastRecommendedVersion,
                    reason,
                    when
                }) => `From ${when}, this software is no longer recommended${
                    reason === undefined ? "" : `, ${reason}`
                }}.
                ${
                    lastRecommendedVersion === undefined
                        ? ""
                        : `Last acceptable version: ${lastRecommendedVersion}`
                }`
            },
            "PreviewTab": {
                "about": "About",
                "use full links": "Use full links",
                "prerogatives": "Prerogatives",
                "last version": "Last version",
                "register": "In sill since: ",
                "minimal version": "Minimal required version: ",
                "license": "License : ",
                "hasDesktopApp": "Installable on agent computer",
                "isAvailableAsMobileApp": "Mobile app available",
                "isPresentInSupportMarket": "Present in support market",
                "isFromFrenchPublicService": "From French public service",
                "isRGAACompliant": "Is compliant with RGAA rules",
                "comptoire du libre sheet": "Open Comptoir du libre sheet",
                "wikiData sheet": "Open Wikidata sheet",
                "what is the support market": ({ url }) => (
                    <>
                        The DGFIP manages two inter-ministerial markets: support (Atos)
                        and expertise (multiple contractors) for open-source software,
                        covering maintenance, monitoring, and expert services.
                        <br />
                        <a href={url} target="blank">
                            Learn more
                        </a>
                    </>
                ),
                "CNLL service providers title": "CNLL service providers",
                "CNLL service providers": ({ count }) =>
                    `See the ${count} service providers on the CNLL index`
            },
            "ReferencedInstancesTab": {
                "instanceCount": ({ instanceCount, publicOrganizationCount }) =>
                    `${instanceCount} maintained instance by ${publicOrganizationCount} public organisation`,
                "concerned public": "Concerned public : ",
                "go to instance": "Open the instance",
                "add instance": "Reference new instance",
                "edit instance": "Edit instance"
            },
            "SimilarSoftwareTab": {
                "similar software in sill": "Alike software in the SILL",
                "similar software not in sill":
                    "Other similar software that are not in the SILL, they might be proprietary or not",
                "libre software": "Libre software - click to add to the SILL"
            },
            "CnllServiceProviderModal": {
                "close": "Close",
                "content description": ({ cnllWebsiteUrl, softwareName, count }) => (
                    <>
                        {count} service provider{count === 1 ? "" : "s"} listed in the
                        <a href={cnllWebsiteUrl} target="_blank" rel="noreferrer">
                            CNLL index
                        </a>{" "}
                        for {softwareName}.
                    </>
                ),
                "modal title": "CNLL service providers"
            },
            "DetailUsersAndReferents": {
                "userAndReferentCount": ({ userCount, referentCount, referentColor }) => (
                    <>
                        {userCount !== 0 && <>{userCount} users and </>}
                        <span style={{ "color": referentColor }}>
                            {referentCount} referents
                        </span>
                    </>
                )
            },
            "SoftwareUserAndReferent": {
                "catalog breadcrumb": "Software catalog",
                "user and referent breadcrumb": "Users and referents",
                "title": "Users and referents",
                "tab user title": ({ count }) =>
                    `Users${count > 1 ? "s" : ""} (${count})`,
                "tab referent title": ({ count }) =>
                    `Referent${count > 1 ? "s" : ""} (${count})`,
                "category": "Category",
                "softwareDetails": "See the software sheet",
                "declare user": "Declare yourself as a user",
                "declare referent": "Declare yourself as a referent",
                "is technical expert": "Technical expert",
                "organization": "Organization",
                "is user of": "Is user of",
                "is referent of": "Is referent of",
                "use case": "Use case"
            },
            "DeclarationForm": {
                "catalog breadcrumb": "Software catalog",
                "declare yourself user or referent breadcrumb":
                    "Declare yourself user or referent of the software",
                "title step 1": "How would you like to declare ?",
                "title step 2 user": "About your usage",
                "title step 2 referent": "About your referencing",
                "submit declaration": "Submit declaration"
            },
            "DeclarationFormStep1": {
                "user type label": "I'm a user of this software",
                "user type hint": "Inside my organization",
                "referent type label": "I would like to be referent of this software",
                "referent type hint":
                    "As a guarantor and reference of the use of this software inside my organization"
            },
            "DeclarationFormStep2User": {
                "useCase": "Describe in a few words your use case",
                "environment": "In which environment do you use your software ?",
                "version": "Which version of the software do you use ? (Optional)",
                "service": "More precisely, which service of the software do you use ?"
            },
            "DeclarationFormStep2Referent": {
                "legend title": "Are you a technical expert of this software ?",
                "legend hint": "You are able to answer to questions of agents and of CIO",
                "useCase": "Describe in a few words the use case of your administration",
                "service":
                    "More precisely, which service of the software do you declare yourself referent"
            },
            "Account": {
                "title": "My Account",
                "mail": "Email Address",
                "organization": "Affiliated Organization Name",
                "change password": "Change Your Password",
                "no organization": "No Organization",
                "update": "Update",
                "not a valid email": "Doesn't seem to be a valid email",
                "email domain not allowed": ({ domain }) =>
                    `The domain ${domain} is not allowed yet`,
                "about title": "Open Source Profile",
                "about description": `Sketch out an overview of your journey and commitments to open source. 
                Share your experiences here, how you use or contribute to open source, and any information you 
                wish to highlight within the SILL community.`,
                "isPublic label": "Public Profile",
                "isPublic hint": ({ profileLik }) => (
                    <>
                        By enabling this option &nbsp;
                        <a {...profileLik}>your SILL profile</a>&nbsp;will be made
                        publicly accessible.
                    </>
                ),
                "go to profile": "Go to public profile"
            },
            "UserProfile": {
                "agent profile": ({ email, organization }) =>
                    `Profile of ${email} - ${organization}`,
                "send email": "Send an email to this person",
                "no description": "The user has not written a description yet",
                "edit my profile": "Edit my profile",
                "badge text": ({ isReferent, isTechnicalExpert, isUser }) => {
                    if (isReferent && isTechnicalExpert) {
                        return "Technical expert referent";
                    }
                    if (isReferent) {
                        return "Referent";
                    }
                    if (isUser) {
                        return "User";
                    }
                    assert(false);
                }
            },
            "Header": {
                "home title": "Home - Interministerial Free Software Catalog",
                "title": "Interministerial Free Software Catalog",
                "navigation welcome": "Welcome to the SILL",
                "navigation catalog": "Software catalog",
                "navigation add software": "Add software or instance",
                "navigation update software": "Update software or instance",
                "navigation support request": "Support request",
                "navigation about": "About the site",
                "quick access test": "Immediate test",
                "quick access login": "Sign in",
                "quick access logout": "Sign out",
                "quick access account": "My account",
                "select language": "Select language"
            },
            "Footer": {
                "contribute": "Contribute"
            },
            "DeclarationRemovalModal": {
                "confirm": "Confirm",
                "cancel": "Cancel",
                "do you confirm": ({ declarationType, softwareName }) =>
                    `Do you confirm that you're no longer ${(() => {
                        switch (declarationType) {
                            case "referent":
                                return "willing to be referent of";
                            case "user":
                                return "using";
                        }
                    })()} ${softwareName}?`,
                "stop being user/referent": ({ declarationType, softwareName }) =>
                    `Stop being a ${declarationTypeToEnglish[declarationType]} of ${softwareName}`
            },
            "SmartLogo": {
                "software logo": "Software logo"
            }
        },
        "fr": {
            /* spell-checker: disable */
            "App": {
                "yes": "Oui",
                "no": "Non",
                "not applicable": "Non applicable",
                "previous": "Précédent",
                "next": "Suivant",
                "add software": "Ajouter un logiciel",
                "update software": "Mettre à jour un logiciel",
                "add software or service": "Ajouter un logiciel ou un service",
                "add instance": "Ajouter une instance",
                "update instance": "Modifier une instance",
                "required": "Ce champ est requis",
                "invalid url": 'URL invalide. Elle doit commencer par "http"',
                "invalid version": "La valeur doit être numérique (Exemple : 2.0.1)",
                "all": "Tous",
                "allFeminine": "Toutes",
                "loading": "Chargement...",
                "no result": "Aucun Résultat",
                "search": "Rechercher",
                "validate": "Valider",
                "not provided": "Non Renseigné"
            },
            "Home": {
                "title": ({ accentColor }) => (
                    <>
                        <span style={{ "color": accentColor }}>
                            Catalogue de référence de logiciels libres
                        </span>{" "}
                        recommandés pour l'ensemble de l'administration.
                    </>
                ),
                "software selection": "Sélections de logiciels",
                "last added": "Ajouts récents",
                "most used": "Les plus populaires",
                "essential": "Indispensables sur votre poste",
                "recently updated": "Mises à jour récentes",
                "waiting for referent": "En attente d'un référent",
                "in support market": "Disponible dans le marché du support",
                "SILL numbers": "Le SILL en chiffres",
                "softwareCount": "logiciels référencés",
                "registeredUserCount": "utilisateurs inscrits",
                "agentReferentCount": "référents logiciels",
                "organizationCount": "organismes présents",
                "help us":
                    "Vous êtes agent public ? Aidez-nous à enrichir le catalogue !",
                "declare referent title":
                    "Se déclarer utilisateur ou référent d'un logiciel",
                "edit software title": "Modifier une fiche logiciel",
                "the sill in a few words": "Le SILL en quelques mots",
                "the sill in a few words paragraph": ({ accentColor }) => (
                    <>
                        <p>
                            Le Socle Interministériel de Logiciels Libres (SILL) est un
                            catalogue de référence des logiciels libres recommandés pour
                            l' administration française.
                        </p>
                        <p>
                            Il est utilisé pour aider les administrations à naviguer et
                            sélectionner les{" "}
                            <a
                                href="https://fr.wikipedia.org/wiki/Logiciel_libre"
                                style={{ "color": accentColor }}
                            >
                                logiciels libres
                            </a>{" "}
                            à utiliser, conformément à l'
                            <a
                                href="https://www.legifrance.gouv.fr/jorf/article_jo/JORFARTI000033203039"
                                style={{ "color": accentColor }}
                            >
                                article 16 de la loi pour une République numérique
                            </a>
                            .
                        </p>
                        <p>
                            Les{" "}
                            <a
                                href="https://code.gouv.fr/sill/readme"
                                style={{ "color": accentColor }}
                            >
                                critères d'entrée
                            </a>{" "}
                            d'un logiciel dans le SILL comprennent la publication de son
                            code source sous une{" "}
                            <a
                                href="https://code.gouv.fr/fr/doc/licences-libres-dinum"
                                style={{ "color": accentColor }}
                            >
                                licence libre acceptée
                            </a>{" "}
                            et son déploiement par un établissement public ou son
                            installation par un agent public.
                        </p>
                        <p>
                            Les référents SILL sont des agents publics qui se portent
                            volontaires pour gérer et mettre à jour les informations sur
                            les logiciels inclus dans le catalogue.
                        </p>
                    </>
                ),
                "illustration image": "Image d'illustration",
                "add software or service title": "Ajouter un logiciel ou un service",
                "declare referent desc":
                    "Se porter volontaire pour gérer et mettre à jour les informations sur les logiciels du SILL",
                "edit software desc":
                    "Modifier les informations d'un logiciel existant dans le catalogue SILL",
                "add software or service desc":
                    "Proposer un nouveau logiciel ou service pour inclusion dans le catalogue SILL",
                "declare referent button label": "Accéder au formulaire",
                "edit software button label": "Rechercher un logiciel",
                "add software or service button label": "Compléter le formulaire d'ajout"
            },
            "AddSoftwareLanding": {
                "title": (
                    <>
                        <span>Vous êtes agent public ? </span>Ajoutez des logiciels libres
                        ou des instances de logiciels libres utilisés ou déployés dans
                        votre organisation !
                    </>
                ),
                "subtitle":
                    "Contribuez à la création d'une plateforme de référence pour les logiciels du service public et partagez des informations utiles aux agents et aux DSI de l'administration.",
                "who can add software":
                    "Qui peut ajouter un logiciel ou un service et comment faire ?",
                "discover as agent label": "Découvrir en tant qu'agent",
                "discover as agent description": (
                    <>
                        En tant qu'agent public, utiliser le SILL (Socle Interministériel
                        de Logiciels Libres) présente plusieurs avantages.
                        <br />
                        Premièrement, il facilite la recherche et la sélection de
                        logiciels libres recommandés par l'État, ce qui permet de
                        s'assurer de la qualité, la sécurité et la conformité des outils
                        utilisés dans l'administration.
                        <br />
                        De plus, le SILL encourage la collaboration entre agents publics
                        de différentes fonctions publiques (État, hospitalière et
                        territoriale), favorisant ainsi l'échange d'expériences et de
                        bonnes pratiques.
                        <br />
                        En utilisant des logiciels référencés dans le SILL, les agents
                        publics contribuent à la maîtrise, la pérennité et l'indépendance
                        des systèmes d'information de leur administration, conformément à
                        l'article 16 de la loi pour une République numérique.
                        <br />
                        Enfin, en devenant référent SILL pour un logiciel libre, un agent
                        public peut non seulement partager son expertise et ses
                        connaissances, mais également bénéficier du soutien et des
                        conseils de la communauté des référents SILL et de la mission
                        logiciels libres de la DINUM.
                    </>
                ),
                "discover as DSI label": "Découvrir en tant que DSI",
                "discover as DSI description": (
                    <>
                        En tant que Directeur des Systèmes d'Information (DSI), utiliser
                        le SILL offre de nombreux avantages pour la gestion et l'évolution
                        des systèmes informatiques de votre administration.
                        <br />
                        Le SILL facilite l'évaluation et la sélection des logiciels libres
                        recommandés par l'État, garantissant ainsi la conformité, la
                        qualité et la sécurité des solutions mises en œuvre.
                        <br />
                        De plus, le recours aux logiciels référencés dans le SILL
                        contribue à renforcer l'indépendance, la maîtrise et la pérennité
                        des systèmes d'information, en accord avec la loi pour une
                        République numérique.
                        <br />
                        Le SILL permet également de bénéficier du retour d'expérience et
                        des bonnes pratiques partagées par la communauté des référents
                        SILL et la mission logiciels libres de la DINUM, favorisant ainsi
                        la coopération inter-administrative.
                        <br />
                        En outre, l'adoption de logiciels libres peut engendrer des
                        économies sur les coûts de licence et de maintenance, tout en
                        encourageant l'innovation et l'interopérabilité.
                        <br />
                        Finalement, en tant que DSI, le SILL peut aider à optimiser la
                        gestion des ressources informatiques et à promouvoir une culture
                        de l'ouverture et de la collaboration au sein de l'administration.
                    </>
                ),
                "contribute as agent label": "Contribuer en tant qu'agent",
                "contribute as agent description": (
                    <>
                        En tant qu'agent public, contribuer au SILL vous permet d'apporter
                        une valeur ajoutée à la communauté en partageant vos connaissances
                        et en facilitant l'adoption de logiciels libres au sein de
                        l'administration. <br />
                        Contribuer consiste principalement à ajouter des logiciels et à
                        devenir référent pour ces derniers. En ajoutant un logiciel libre
                        au SILL, vous aidez d'autres agents à découvrir des solutions
                        fiables et performantes qui répondent à leurs besoins. <br />
                        Devenir référent pour un logiciel vous permet d'attester de son
                        usage au sein de votre administration, de contribuer à la mise à
                        jour des informations pertinentes sur ce logiciel (version
                        minimale recommandée, fiche, etc.), et d'accepter d'être contacté
                        par d'autres agents publics pour échanger sur le logiciel en
                        question. <br />
                        En tant que référent SILL, vous pouvez également vous inscrire à
                        la liste de discussion des mainteneurs du SILL et participer aux
                        réunions des mainteneurs, renforçant ainsi la coopération et le
                        partage d'expérience au sein de la communauté des référents.{" "}
                        <br />
                        En somme, contribuer au SILL en tant qu'agent public vous offre
                        l'opportunité de développer votre expertise, d'aider vos collègues
                        et de promouvoir l'utilisation de logiciels libres dans
                        l'administration.
                    </>
                ),
                "contribute as DSI label": "Contribuer en tant que DSI",
                "contribute as DSI description": (
                    <>
                        En tant que Directeur des Systèmes d'Information (DSI), contribuer
                        au SILL vous permet d'améliorer et de soutenir l'écosystème des
                        logiciels libres au sein de l'administration, tout en partageant
                        votre expertise et en favorisant l'innovation. <br />
                        Contribuer consiste principalement à ajouter des logiciels et à
                        devenir référent pour ces derniers. En ajoutant un logiciel libre
                        au SILL, vous aidez d'autres administrations à identifier des
                        solutions éprouvées et efficaces qui correspondent à leurs
                        besoins, tout en renforçant l'interopérabilité et la collaboration
                        inter-administrative. <br />
                        Devenir référent pour un logiciel vous permet d'attester de son
                        déploiement au sein de votre administration, de contribuer à la
                        mise à jour des informations pertinentes sur ce logiciel (version
                        minimale recommandée, fiche, etc.), et d'accepter d'être contacté
                        par d'autres agents publics pour échanger sur le logiciel en
                        question. <br />
                        En tant que référent SILL, vous pouvez également vous inscrire à
                        la liste de discussion des mainteneurs du SILL et participer aux
                        réunions des mainteneurs, renforçant ainsi la coopération et le
                        partage d'expérience au sein de la communauté des référents.{" "}
                        <br />
                        En somme, contribuer au SILL en tant que DSI vous offre
                        l'opportunité de promouvoir l'utilisation des logiciels libres, de
                        développer votre expertise et d'encourager une culture d'ouverture
                        et de collaboration au sein de l'administration.
                    </>
                )
            },
            "SoftwareForm": {
                "stepper title": ({ currentStepIndex, softwareName, action }) => {
                    switch (currentStepIndex) {
                        case 1:
                            return (() => {
                                switch (action) {
                                    case "add":
                                        return softwareName === undefined
                                            ? "Quel est le type du logiciel que vous désirez ajouter?"
                                            : `À quelle type de logicel correspond ${softwareName}?`;
                                    case "update":
                                        return `Modifier le type de ${softwareName}`;
                                }
                            })();
                        case 2:
                            return `Information${
                                softwareName === undefined
                                    ? ""
                                    : ` à propos de ${softwareName}`
                            }`;
                        case 3:
                            return `Pré-requis${
                                softwareName === undefined ? "" : ` pour ${softwareName}`
                            }`;
                        case 4:
                            return `Logiciels similaires ou équivalents${
                                softwareName === undefined ? "" : ` à ${softwareName}`
                            }`;
                        default:
                            return "";
                    }
                },
                "add software": ({ name }) =>
                    name === undefined ? "Ajouter un logiciel" : `Ajouter ${name}`,
                "update software": ({ name }) => `Mettre à jour ${name}`,
                "add software button": ({ name }) => `Ajouter ${name} au SILL`,
                "update software button": ({ name }) => `Mettre à jour ${name}`
            },
            "SoftwareFormStep1": {
                "software desktop": "Logiciel installable sur poste de travail",
                "software cloud":
                    "Solution logicielle applicative hébergée dans le cloud",
                "software cloud hint": "Cloud public ou cloud de votre organisation",
                "module": "Briques ou modules techniques",
                "module hint": "Par exemple des proxy, serveurs HTTP ou plugins",
                "checkbox legend":
                    "Système d'exploitation sur lequel le logiciel peut être installé"
            },
            "SoftwareFormStep2": {
                "wikidata id": "Fiche Wikidata",
                "wikidata id hint": ({
                    wikidataUrl,
                    wikidataPageExampleUrl,
                    exampleSoftwareName,
                    softwareSillUrl
                }) => (
                    <>
                        Renseignez le nom du logiciel ou directement l'identifiant (de la
                        forme <code>QXXXXX</code>) pour associez le logiciel à une fiche
                        existante{" "}
                        <a href={wikidataUrl} target="_blank" rel="noreferrer">
                            Wikidata
                        </a>
                        .
                        <br />
                        La plupart des informations générales, telles que le logo ou l'URL
                        du dépôt de code, sont extraites de Wikidata. Si le logiciel que
                        vous souhaitez ajouter ne possède pas encore de fiche sur
                        Wikidata, vous pouvez en créer une. Vous trouverez ici un{" "}
                        <a href={wikidataPageExampleUrl} target="_blank" rel="noreferrer">
                            exemple de fiche Wikidata
                        </a>
                        pour le logiciel&nbsp;
                        <a href={softwareSillUrl} target="_blank" rel="noreferrer">
                            {exampleSoftwareName}
                        </a>{" "}
                    </>
                ),
                "wikidata id information":
                    "Cette information remplira automatiquement d'autres champs",
                "comptoir du libre id": "Identifiant Comptoir du Libre (Optionnel)",
                "comptoir du libre id hint":
                    "Si le logiciel est présent sur le comptoir du libre vous pouvez renseigner son identifiant ou l'URL de sa fiche",
                "software name": "Nom du logiciel",
                "software feature": "Fonction du logiciel",
                "software feature hint":
                    "Décrivez en quelques mots les fonctionnalités du logiciel",
                "license": "Licence du logiciel",
                "license hint": "(GNU, GPL, BSD, etc.)",
                "minimal version": "Version minimale",
                "minimal version hint":
                    "Version la plus ancienne encore acceptable en production",
                "url or numeric id":
                    "Ce champ doit contenir une URL ou un numéro d'identifiant",
                "autofill notice":
                    "Cette information remplira automatiquement d'autres champs",
                "logo url": "URL vers une image du logo du logiciel",
                "logo url hint":
                    "La fonctionnalité Access-Control-Allow-Origin (CORS) doit être activée sur le site",
                "must be an url": "Doit être un URL valide",
                "keywords": "Mot-clés",
                "keywords hint":
                    "mots-clés pour aider à la recherche du logiciel, séparés par des virgules",
                "logo preview alt": "Aperçu du logo du logiciel",
                "invalid comptoir du libre id":
                    "Doit être un URL comptoir du libre ou un identifiant numérique"
            },
            "SoftwareFormStep3": {
                "is present in support market":
                    "Le logiciel est-il présent dans le marché de support ?",
                "is from french public service":
                    "Le logiciel est-il développé par le service public français ?",
                "do respect RGAA": "Le logiciel respecte-il les normes RGAA?"
            },
            "SoftwareFormStep4": {
                "similar software": "Ce logiciel est une alternative à ...",
                "similar software hint":
                    "Associez le logiciel à des logiciels similaires, propriétaires ou non"
            },
            "InstanceForm": {
                "breadcrumb add instance": "Ajouter une instance",
                "breadcrumb update instance": "Mettre à jour une instance",
                "title add instance form": "Ajouter une instance de logiciel",
                "title update instance form": "Mettre à jour une instance de logiciel",
                "stepper title": ({ currentStepIndex }) => {
                    switch (currentStepIndex) {
                        case 1:
                            return "À propos du logiciel instancié";
                        case 2:
                            return "À propos de l'instance";
                        default:
                            return "";
                    }
                },
                "submit": "Ajouter"
            },
            "InstanceFormStep1": {
                "software instance":
                    "Quel est le logiciel principal utilisé et déployé par votre instance ?",
                "other software":
                    "Y a-t-il d'autres logiciels mobilisés par votre instance ?"
            },
            "InstanceFormStep2": {
                "is in public access label":
                    "Votre instance est-elle accessible publiquement ?",
                "is in public access hint": "*Au sein du service public",
                "instance url label": "Si oui, quelle est l'URL de l'instance ?",
                "instance url hint":
                    "Afin de proposer un accès rapide au service proposé",
                "organization label": "Quelle est l'organisation concernée ?",
                "organization hint":
                    "Quelle est l'organisation étatique qui maintient cette instance ?",
                "targeted public label": "Quel est le public concerné ?",
                "targeted public hint":
                    "Décrivez en quelques mots à qui l'offre de service est proposée"
            },
            "SoftwareCatalogCard": {
                "latest version": ({ fromNowText }) => `Dernière version ${fromNowText}`,
                "declare oneself referent": "Se déclarer référent / utilisateur",
                "hasDesktopApp": "Ce logiciel s'installe sur ordinateur",
                "isFromFrenchPublicService":
                    "Ce logiciel est originaire du service public français",
                "isPresentInSupportMarket":
                    "Ce logiciel est présent dans le marché de support",
                "you are user": "Vous l'utilisez",
                "you are referent": "Vous êtes référent"
            },
            "SoftwareCatalogControlled": {
                "search results": ({ count }) =>
                    `${count} logiciel${count === 1 ? "" : "s"} libre${
                        count === 1 ? "" : "s"
                    }`,
                "sort by": "Trier par",
                "added_time": "Dernier ajouté",
                "update_time": "Dernier mis à jour",
                "referent_count": "Nombre de référents",
                "referent_count_ASC": "Nombre de référents croissant",
                "user_count": "Nombre d'utilisateurs membres",
                "user_count_ASC": "Nombre d'utilisateurs membres croissant",
                "latest_version_publication_date": "Dernière version publiée",
                "no software found": "Aucun logiciel trouvé",
                "best_match": "Résultats les plus pertinents",
                "my_software": "Mes logiciels"
            },
            "SoftwareCatalogSearch": {
                "placeholder": "Rechercher un logiciel",
                "filtersButton": "Filtres",
                "organizationLabel": "Organisation",
                "categoriesLabel": "Catégories",
                "environnement label": "Environnement d'utilisation",
                "prerogativesLabel": "Prérogatives",
                "filters": "Filtres",
                "isInstallableOnUserComputer": "Installable sur un poste agent",
                "isAvailableAsMobileApp": "Application mobile disponible",
                "isFromFrenchPublicServices": "Développé par le service public",
                "doRespectRgaa": "Respecte les normes RGAA",
                "isPresentInSupportContract": "Présent dans le marché de support",
                "isTestable": "Est essayable",
                "organization filter hint":
                    "Afficher uniquement les logiciels ayant au mois référent dans une organisation donnée",
                "linux": undefined,
                "mac": undefined,
                "windows": undefined,
                "browser": "Navigateur internet (Ex: Jupiter Notebook)",
                "stack":
                    "Bibliothèques, frameworks et autres briques techniques (Ex: Angular, Ngnix, etc.)",
                "number of prerogatives selected": ({ count }) =>
                    count === 0
                        ? "Aucune"
                        : `${count} sélectionnée${count === 1 ? "" : "s"}`,
                "ios": "iOS (iPhone)",
                "android": "Téléphone Android"
            },
            "SoftwareDetails": {
                "catalog breadcrumb": "Le catalogue de logiciels",
                "tab title overview": "Aperçu",
                "tab title instance": ({ instanceCount }) =>
                    `Instances référencées (${instanceCount})`,
                "tab service providers": ({ serviceProvidersCount }) =>
                    `Prestataires de services (${serviceProvidersCount})`,
                "tab title alike software": ({ alikeSoftwareCount }) =>
                    `Logiciels similaires ou équivalents propriétaires (${alikeSoftwareCount})`,
                "list of service providers": "La liste des prestaires de services",
                "prerogatives": "Prérogatives",
                "last version": "Dernière version : ",
                "last version date": ({ date }) => `en ${date}`,
                "register": "Date de l'ajout: ",
                "register date": ({ date }) => `${date}`,
                "minimal version": "Version minimale requise : ",
                "license": "Licence : ",
                "declare oneself referent": "Se déclarer référent ou utilisateur",
                "hasDesktopApp": "Installable sur poste agent",
                "isPresentInSupportMarket": "Présent dans le marché de support",
                "isFromFrenchPublicService": "Développé par le service public",
                "isRGAACompliant": "Respecte les normes RGAA",
                // "service provider": "Voir les prestataires de services",
                "comptoire du libre sheet": "Consulter la fiche du Comptoir du Libre",
                "wikiData sheet": "Consulter la fiche de Wikidata",
                "share software": "Partager la fiche",
                "declare referent": "Se déclarer référent ou utilisateur",
                "edit software": "Éditer la fiche logiciel",
                "stop being user/referent": ({ declarationType }) =>
                    `Ne plus être ${declarationTypeToFrench[declarationType]}`,
                "become referent": "Devenir référent",
                "please provide a reason for unreferencing this software": `Merci de préciser la raison pour laquelle vous estimez que ce logiciel ne devrait plus être référencé dans le SILL`,
                "unreference software": "Dé-référencer le logiciel"
            },
            "HeaderDetailCard": {
                "authors": "Auteurs : ",
                "website": "Site web officiel",
                "documentation": "Documentation",
                "repository": "Dépôt du code source",
                "software logo": "Logo du logiciel",
                "you are user": "Vous l'utilisez",
                "you are referent": "Vous êtes référent",
                "software dereferenced": ({
                    lastRecommendedVersion,
                    reason,
                    when
                }) => `Depuis ${when}, ce logiciel n'est plus recommandé ${
                    reason === undefined ? "" : ` : « ${reason} »`
                }.
                ${
                    !lastRecommendedVersion
                        ? ""
                        : `Dernière version recommandée : ${lastRecommendedVersion}`
                }`
            },
            "PreviewTab": {
                "about": "À propos",
                "use full links": "Liens utiles",
                "prerogatives": "Prérogatives",
                "last version": "Dernière version : ",
                "register": "Date de l'ajout: ",
                "minimal version": "Version minimale requise : ",
                "license": "Licence : ",
                "hasDesktopApp": "Installable sur poste agent",
                "isAvailableAsMobileApp": "Application mobile disponible",
                "isPresentInSupportMarket": "Présent dans le marché de support",
                "isFromFrenchPublicService": "Développé par le service public",
                "isRGAACompliant": "Respecte les normes RGAA",
                "comptoire du libre sheet": "Consulter la fiche du Comptoir du Libre",
                "wikiData sheet": "Consulter la fiche de Wikidata",
                "what is the support market": ({ url }) => (
                    <>
                        La DGFIP pilote deux marchés interministériels : support (Atos) et
                        expertise (plusieurs titulaires) pour logiciels libres, couvrant
                        maintenance, veille et prestations d'expertise.
                        <br />
                        <a href={url} target="blank">
                            En savoir plus
                        </a>
                    </>
                ),
                "CNLL service providers title": "Prestataires de services CNLL",
                "CNLL service providers": ({ count }) =>
                    `Voir les ${count} prestataires de l'annuaire CNLL`
            },
            "ReferencedInstancesTab": {
                "instanceCount": ({ instanceCount, publicOrganizationCount }) =>
                    `${instanceCount} instances maintenues par ${publicOrganizationCount} organisations publiques`,
                "concerned public": "Public concerné : ",
                "go to instance": "Accéder à l'instance",
                "add instance": "Référencer une nouvelle instance",
                "edit instance": "Éditer l'instance"
            },
            "SimilarSoftwareTab": {
                "similar software in sill": "Logiciels similaires dans le SILL",
                "similar software not in sill":
                    "Logiciels similaires qui ne font pas partie du SILL, ils peuvent être propriétaires ou libres",
                "libre software": "Logiciels libres - cliquez pour ajouter au SILL"
            },
            "CnllServiceProviderModal": {
                "close": "Fermer",
                "content description": ({ cnllWebsiteUrl, softwareName, count }) => (
                    <>
                        {count} fournisseur{count === 0 ? "" : "s"} de services listé dans
                        l'
                        <a href={cnllWebsiteUrl} target="_blank" rel="noreferrer">
                            annuaire CNLL
                        </a>{" "}
                        pour {softwareName}.
                    </>
                ),
                "modal title": "Fournisseur de service de l'anuaire CNLL"
            },
            "DetailUsersAndReferents": {
                "userAndReferentCount": ({ userCount, referentCount, referentColor }) => {
                    return (
                        <>
                            {userCount !== 0 && (
                                <>
                                    {userCount} utilisateur{userCount > 1 ? "s" : ""} et{" "}
                                </>
                            )}
                            <span style={{ "color": referentColor }}>
                                {referentCount} référent{referentCount > 1 ? "s" : ""}
                            </span>
                        </>
                    );
                }
            },
            "SoftwareUserAndReferent": {
                "catalog breadcrumb": "Catalogue",
                "user and referent breadcrumb": "Utilisateurs et référents",
                "title": "Utilisateurs et référents",
                "tab user title": ({ count }) =>
                    `Utilisateur${count > 1 ? "s" : ""} (${count})`,
                "tab referent title": ({ count }) =>
                    `Référent${count > 1 ? "s" : ""} (${count})`,
                "category": "Catégorie",
                "softwareDetails": "Voir la fiche du logiciel",
                "declare user": "Se déclarer utilisateur",
                "declare referent": "Se déclarer référent",
                "is technical expert": "Expert technique",
                "organization": "Organisation",
                "is user of": "Est utilisateur de",
                "is referent of": "Est référent de",
                "use case": "Cas d'usage"
            },
            "DeclarationForm": {
                "catalog breadcrumb": "Le catalogue de logiciels",
                "declare yourself user or referent breadcrumb":
                    "Se déclarer utilisateur ou référent du logiciel",
                "title step 1": "Comment souhaitez-vous déclarer ?",
                "title step 2 user": "À propos de votre usage",
                "title step 2 referent": "À propos de votre référencement",
                "submit declaration": "Envoyer ma déclaration"
            },
            "DeclarationFormStep1": {
                "user type label": "Je suis un utilisateur de ce logiciel",
                "user type hint": "Au sein de mon établissement",
                "referent type label": "Je souhaite devenir référent de ce logiciel",
                "referent type hint":
                    "Comme garant et référence de l'utilisation du logiciel au sein de mon établissement"
            },
            "DeclarationFormStep2User": {
                "useCase": "Décrivez en quelques mots votre cas d'usage",
                "environment": "Dans quel environnement utilisez-vous ce logiciel ?",
                "version": "Quelle version du logiciel utilisez-vous ? (Optionnel)",
                "service": "Plus précisément, quel service du logiciel utilisez-vous ?"
            },
            "DeclarationFormStep2Referent": {
                "legend title": "Êtes-vous un expert technique concernant ce logiciel ?",
                "legend hint":
                    "Vous pouvez répondre aux questions techniques d'agents et de DSI",
                "useCase":
                    "Décrivez en quelques mots le cas d'usage de votre administration",
                "service":
                    "Plus précisément, pour quel service du logiciel vous déclarez-vous référent ?"
            },
            "Account": {
                "title": "Mon compte",
                "mail": "Adresse e-mail",
                "organization": "Nom de l'organisation affiliée",
                "change password": "Modifier votre mot de passe",
                "no organization": "Aucune organisation",
                "update": "Mettre à jour",
                "not a valid email": "Ceci ne semble pas être une adresse e-mail valide",
                "email domain not allowed": ({ domain }) =>
                    `Le domaine ${domain} n'est pas autorisé pour le moment`,
                "about title": "Profil Logiciels Libres",
                "about description": `Dressez un panorama de votre parcours et de vos engagements envers les logiciels libres.
                Partagez ici vos expériences, comment vous utilisez ou contribuez à l'open source, et toutes les informations 
                que vous souhaitez mettre en avant au sein de la communauté du SILL.`,
                "isPublic label": "Profil Public",
                "isPublic hint": ({ profileLik }) => (
                    <>
                        En activant cette option,&nbsp;{" "}
                        <a {...profileLik}>votre profil SILL</a>&nbsp;sera publiquement
                        accessible.
                    </>
                ),
                "go to profile": "Voir mon profil public"
            },
            "UserProfile": {
                "agent profile": ({ email, organization }) =>
                    `Profile de ${email} - ${organization}`,
                "send email": "Envoyer un courrier à l'agent",
                "no description":
                    "Cet agent n'a pas renségné son profil ou son profil n'est pas visible par les autres agents.",
                "edit my profile": "Modifier mon profil",
                "badge text": ({ isReferent, isTechnicalExpert, isUser }) => {
                    if (isReferent && isTechnicalExpert) {
                        return "Référent expert technique";
                    }
                    if (isReferent) {
                        return "Référent";
                    }
                    if (isUser) {
                        return "Utilisateur";
                    }
                    assert(false);
                }
            },
            "Header": {
                "home title": "Accueil - Socle Interministériel des Logiciels Libres",
                "title": "Socle Interministériel des Logiciels Libres",
                "navigation welcome": "Bienvenue sur le SILL",
                "navigation catalog": "Catalogue de logiciels",
                "navigation add software": "Ajouter un logiciel ou une instance ",
                "navigation update software": "Mettre à jour un logiciel ou une instance",
                "navigation support request": "Demande d'accompagnement",
                "navigation about": "À propos du site",
                "quick access test": "Test immédiat",
                "quick access login": "Se connecter",
                "quick access logout": "Se déconnecter",
                "quick access account": "Mon compte",
                "select language": "Sélectionner une langue"
            },
            "Footer": {
                "contribute": "Contribuez"
            },
            "DeclarationRemovalModal": {
                "confirm": "Confirmer",
                "cancel": "Annuler",
                "do you confirm": ({ declarationType, softwareName }) =>
                    `Confirmez vous ${(() => {
                        switch (declarationType) {
                            case "referent":
                                return "ne plus vouloir être référent de";
                            case "user":
                                return "ne plus utiliser";
                        }
                    })()} ${softwareName}?`,
                "stop being user/referent": ({ declarationType, softwareName }) =>
                    `Ne plus être ${declarationTypeToFrench[declarationType]} de ${softwareName}`
            },
            "SmartLogo": {
                "software logo": "Logo du logiciel"
            }
            /* spell-checker: enable */
        }
    }
);

export { useTranslation, resolveLocalizedString, useLang, useResolveLocalizedString };

export const evtLang = statefulObservableToStatefulEvt({
    "statefulObservable": $lang
});

export const zLocalizedString = z.union([
    z.string(),
    z.record(createUnionSchema(languages), z.string())
]);

{
    type Got = ReturnType<(typeof zLocalizedString)["parse"]>;
    type Expected = LocalizedString;

    assert<Equals<Got, Expected>>();
}

export const softwareCategoriesFrBySoftwareCategoryEn: Record<string, string> = {
    /* spell-checker: disable */
    "Operating Systems": "Systèmes d'exploitation",
    "Web Servers": "Serveurs Web",
    "Databases": "Bases de données",
    "Programming Languages": "Langages de programmation",
    "Web Frameworks": "Frameworks Web",
    "Testing & CI/CD": "Tests & CI/CD",
    "Version Control": "Gestion de versions",
    "Virtualization & Containers": "Virtualisation & Conteneurs",
    "IDEs & Text Editors": "IDEs & Éditeurs de texte",
    "Project Management & Collaboration": "Gestion de projets & Collaboration",
    "Content Management Systems": "Systèmes de gestion de contenu",
    "E-Learning & Education": "E-Learning & Éducation",
    "Desktop Applications": "Applications de bureau",
    "Web Applications": "Applications Web",
    "Office & Productivity": "Bureautique & Productivité",
    "Security & Privacy": "Sécurité & Confidentialité",
    "Web Browsers & Extensions": "Navigateurs Web & Extensions",
    "Email Clients & Servers": "Clients de messagerie & Serveurs",
    "API Management & Networking": "Gestion d'API & Réseautage",
    "GeoSpatial": "GéoSpatial",
    "Other Development Tools": "Autres outils de développement",
    "Miscellaneous": "Divers"
    /* spell-checker: enable */
};

const declarationTypeToFrench: Record<DeclarationType, string> = {
    user: "utilisateur",
    referent: "référent"
};

const declarationTypeToEnglish: Record<DeclarationType, string> = {
    user: "user",
    referent: "referent"
};
