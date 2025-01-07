import { createI18nApi, declareComponentKeys } from "i18nifty";
import { languages, type Language, type ExternalDataOrigin } from "api";
import { assert } from "tsafe/assert";
import type { Equals } from "tsafe";
import { statefulObservableToStatefulEvt } from "powerhooks/tools/StatefulObservable/statefulObservableToStatefulEvt";
import { z } from "zod";
import { createUnionSchema } from "ui/tools/zod/createUnionSchema";
import { DeclarationType } from "../shared/DeclarationRemovalModal";
import { ReactNode } from "react";

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
} = createI18nApi<typeof import("ui/App").i18n>()(
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
            }
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

type I18nTextByExternalSourceByLanguage = Record<
    Language,
    Record<ExternalDataOrigin, ReactNode>
>;

const linksByExternalDataSource: Record<
    ExternalDataOrigin,
    {
        externalSourceUrl: string;
        externalSourcePageExampleUrl: string;
        softwareSillUrl: string;
        exampleSoftwareName: string;
    }
> = {
    wikidata: {
        "externalSourceUrl": "https://www.wikidata.org/wiki",
        "externalSourcePageExampleUrl": "https://www.wikidata.org/wiki/Q107693197",
        "softwareSillUrl": "https://code.gouv.fr/sill/detail?name=Keycloakify",
        "exampleSoftwareName": "Keycloakify"
    },
    HAL: {
        "externalSourceUrl": "https://hal.science",
        "externalSourcePageExampleUrl": "https://hal.science/hal-02818886v1",
        "softwareSillUrl": "",
        "exampleSoftwareName": ""
    }
};

function externalId(language: Language) {
    return (externalDataOrigin: ExternalDataOrigin) => {
        const externalIdBySource: I18nTextByExternalSourceByLanguage = {
            fr: {
                wikidata: "Fiche Wikidata",
                HAL: "Fiche HAL"
            },
            en: {
                wikidata: "Wikidata item",
                HAL: "HAL item"
            }
        };

        return externalIdBySource[language][externalDataOrigin];
    };
}

// TODO Dual case
function externalIdHint(language: Language) {
    return (externalDataOrigin: ExternalDataOrigin) => {
        const {
            exampleSoftwareName,
            externalSourcePageExampleUrl,
            externalSourceUrl,
            softwareSillUrl
        } = linksByExternalDataSource[externalDataOrigin];

        const externalIdHintByExternalSourceByLanguage: I18nTextByExternalSourceByLanguage =
            {
                fr: {
                    wikidata: (
                        <>
                            Renseignez le nom du logiciel ou directement l'identifiant (de
                            la forme <code>QXXXXX</code>) pour associer le logiciel à une
                            fiche existante{" "}
                            <a href={externalSourceUrl} target="_blank" rel="noreferrer">
                                Wikidata
                            </a>
                            .
                            <br />
                            La plupart des informations générales, telles que le logo ou
                            l'URL du dépôt de code, sont extraites de Wikidata. Si le
                            logiciel que vous souhaitez ajouter ne possède pas encore de
                            fiche sur Wikidata, vous pouvez en créer une. Vous trouverez
                            ici un{" "}
                            <a
                                href={externalSourcePageExampleUrl}
                                target="_blank"
                                rel="noreferrer"
                            >
                                exemple de fiche Wikidata
                            </a>{" "}
                            pour le logiciel&nbsp;
                            <a href={softwareSillUrl} target="_blank" rel="noreferrer">
                                {exampleSoftwareName}
                            </a>
                            .{" "}
                        </>
                    ),
                    HAL: (
                        <>
                            Renseignez le nom du logiciel ou directement l'identifiant
                            (attention, les identifiants HAL sont de la forme
                            hal-123123v1, il faut fournir uniquement le numéro (sans
                            'hal-' et sans version), dans ce cas '123123') pour associer
                            le logiciel à une fiche existante{" "}
                            <a href={externalSourceUrl} target="_blank" rel="noreferrer">
                                HAL
                            </a>
                            .
                            <br />
                            La plupart des informations générales, telles que l'URL du
                            dépôt de code, sont extraites de HAL. Si le logiciel que vous
                            souhaitez ajouter ne possède pas encore de fiche sur HAL, vous
                            pouvez en créer une. Vous trouverez ici un{" "}
                            <a
                                href={externalSourcePageExampleUrl}
                                target="_blank"
                                rel="noreferrer"
                            >
                                exemple de fiche HAL
                            </a>
                            .
                        </>
                    )
                },
                en: {
                    wikidata: (
                        <>
                            Fill up a name or directly the id (of the form{" "}
                            <code>Qxxxxx</code>) to associate the software with an
                            existing entry{" "}
                            <a href={externalSourceUrl} target="_blank" rel="noreferrer">
                                Wikidata
                            </a>
                            .
                            <br />
                            Most general information, such as the logo or the URL of the
                            code repository, is extracted from Wikidata. If the software
                            you want to add does not have a Wikidata entry yet, you can
                            create one . Find here an{" "}
                            <a
                                href={externalSourcePageExampleUrl}
                                target="_blank"
                                rel="noreferrer"
                            >
                                example of a Wikidata entry
                            </a>
                            &nbsp; for the software&nbsp;
                            <a href={softwareSillUrl} target="_blank" rel="noreferrer">
                                {exampleSoftwareName}
                            </a>{" "}
                        </>
                    ),
                    HAL: (
                        <>
                            Fill up a name or directly the id (careful, HAL ids look like
                            'hal-123123v1', but only the number should be provided
                            (without 'hal-' or the version), in this case it should be
                            '123123') to associate the software with an existing entry{" "}
                            <a href={externalSourceUrl} target="_blank" rel="noreferrer">
                                Wikidata
                            </a>
                            .
                            <br />
                            Most general information, such as the URL of the code
                            repository, is extracted from HAL. If the software you want to
                            add does not have a Hal entry yet, you can create one. Find
                            here an{" "}
                            <a
                                href={externalSourcePageExampleUrl}
                                target="_blank"
                                rel="noreferrer"
                            >
                                example of an HAL entry
                            </a>
                        </>
                    )
                }
            };

        return externalIdHintByExternalSourceByLanguage[language][externalDataOrigin];
    };
}
