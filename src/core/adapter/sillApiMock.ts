import memoize from "memoizee";
import type { SillApi } from "../ports/SillApi";
import { id } from "tsafe/id";
import LogoNextCloud from "ui/assets/logo_nextcloud.png";
import LogoLibreOffice from "ui/assets/logo_libreoffice.png";
import LogoWordpress from "ui/assets/logo_wordpress.png";
import LogoNeovim from "ui/assets/logo_neovim.png";
import { assert } from "tsafe/assert";
import type { ApiTypes } from "@codegouvfr/sill";

export const sillApi: SillApi = {
    "getRedirectUrl": async () => undefined,
    "getApiVersion": memoize(async () => "0.0.0", { "promise": true }),
    "getOidcParams": memoize(
        async () => ({
            "keycloakParams": undefined,
            "jwtClaimByUserKey": {
                "organization": "a",
                "email": "b",
                "id": "c"
            }
        }),
        { "promise": true }
    ),
    "getOrganizationUserProfileAttributeName": memoize(
        async () => {
            throw new Error("not implemented");
        },
        { "promise": true }
    ),
    "getSoftwares": memoize(() => Promise.resolve([...softwares]), { "promise": true }),
    "getInstances": memoize(
        async () => {
            return id<ApiTypes.Instance[]>([
                {
                    "id": 0,
                    "mainSoftwareSillId": 9,
                    "organization": "CNRS",
                    "otherWikidataSoftwares": [],
                    "publicUrl": "https://videos.ahp-numerique.fr/",
                    "targetAudience": `Plateforme vidéos des Archives Henri-Poincaré (laboratoire du CNRS, de l'Université de Lorraine et de 
                l'Université de Strasbourg). Vous y trouverez des vidéos de philosophie et d'histoire des sciences et des techniques.`
                }
            ]);
        },
        { "promise": true }
    ),
    "getWikidataOptions": async ({ queryString }) => {
        if (queryString === "") {
            return [];
        }

        await new Promise(resolve => setTimeout(resolve, 2000));

        return options;
    },
    "getSoftwareFormAutoFillDataFromWikidataAndOtherSources": async ({ wikidataId }) => {
        await new Promise(resolve => setTimeout(resolve, 1));

        return {
            wikidataId,
            "comptoirDuLibreId": 123,
            "softwareName": `Software ${wikidataId}`,
            "softwareDescription": `Software ${wikidataId} description`,
            "softwareLicense": `Software ${wikidataId} license`,
            "softwareMinimalVersion": `1.3.4`,
            "softwareLogoUrl": undefined,
            "keywords": []
        };
    },
    "createSoftware": async ({ formData }) => {
        console.log(`Software created ${JSON.stringify(formData, null, 2)}`);

        const software: ApiTypes.Software = {
            "logoUrl": undefined,
            "softwareId":
                softwares
                    .map(({ softwareId }) => softwareId)
                    .sort()
                    .reverse()[0] + 1,
            "softwareName": formData.softwareName,
            "dereferencing": undefined,
            "codeRepositoryUrl": undefined,
            "authors": [],
            "versionMin": "3.9.0",
            "comptoirDuLibreServiceProviderCount": 0,
            "comptoirDuLibreId": formData.comptoirDuLibreId,
            "wikidataId": formData.wikidataId,
            "license": formData.softwareLicense,
            "officialWebsiteUrl": undefined,
            "softwareDescription": formData.softwareDescription,
            "latestVersion": undefined,
            "parentWikidataSoftware": undefined,
            "softwareType": formData.softwareType,
            "similarSoftwares": [],
            "testUrl": undefined,
            "addedTime": Date.now(),
            "updateTime": Date.now(),
            "categories": [],
            "prerogatives": {
                "doRespectRgaa": false,
                "isFromFrenchPublicServices": formData.isFromFrenchPublicService,
                "isPresentInSupportContract": formData.isPresentInSupportContract ?? false
            },
            "userAndReferentCountByOrganization": {
                "CA du Puy-en-Velay": { "referentCount": 0, "userCount": 1 },
                "CC Pays de Pouzauges": { "referentCount": 1, "userCount": 0 },
                "DINUM": { "referentCount": 2, "userCount": 43 }
            },
            "keywords": [],
            "annuaireCnllServiceProviders": []
        };

        softwares.push(software);
    },
    "updateSoftware": async ({ formData, softwareSillId }) => {
        const index = softwares.findIndex(
            software => software.softwareId === softwareSillId
        );

        assert(index !== -1);

        softwares[index] = {
            ...softwares[index],
            ...id<ApiTypes.Software>({
                "logoUrl": undefined,
                "softwareId":
                    softwares
                        .map(({ softwareId }) => softwareId)
                        .sort()
                        .reverse()[0] + 1,
                "softwareName": formData.softwareName,
                "dereferencing": undefined,
                "codeRepositoryUrl": undefined,
                "authors": [],
                "versionMin": "3.9.0",
                "comptoirDuLibreServiceProviderCount": 0,
                "comptoirDuLibreId": formData.comptoirDuLibreId,
                "wikidataId": formData.wikidataId,
                "license": formData.softwareLicense,
                "officialWebsiteUrl": undefined,
                "softwareDescription": formData.softwareDescription,
                "latestVersion": undefined,
                "parentWikidataSoftware": undefined,
                "softwareType": formData.softwareType,
                "similarSoftwares": [],
                "testUrl": undefined,
                "addedTime": Date.now(),
                "updateTime": Date.now(),
                "categories": [],
                "prerogatives": {
                    "doRespectRgaa": false,
                    "isFromFrenchPublicServices": formData.isFromFrenchPublicService,
                    "isPresentInSupportContract":
                        formData.isPresentInSupportContract ?? false
                },
                "userAndReferentCountByOrganization": {
                    "CA du Puy-en-Velay": { "referentCount": 0, "userCount": 1 },
                    "CC Pays de Pouzauges": { "referentCount": 1, "userCount": 0 },
                    "DINUM": { "referentCount": 2, "userCount": 43 }
                },
                "keywords": [],
                "annuaireCnllServiceProviders": []
            })
        };
    },
    "createUserOrReferent": async ({ formData }) => {
        console.log(`User or referent updated ${JSON.stringify(formData, null, 2)}`);
    },
    "removeUserOrReferent": async ({ declarationType, softwareName }) => {
        console.log(
            `removed user or referent ${JSON.stringify(
                { declarationType, softwareName },
                null,
                2
            )}`
        );
    },
    "createInstance": async params => {
        console.log(`Creating instance ${JSON.stringify(params)}`);
        return {
            "instanceId": 33
        };
    },
    "updateInstance": async params => {
        console.log(`Updating instance ${JSON.stringify(params)}`);
    },
    "getAgents": memoize(async () => ({ "agents": id<ApiTypes.Agent[]>([...agents]) }), {
        "promise": true
    }),
    "changeAgentOrganization": async ({ newOrganization }) => {
        console.log(`Update organization -> ${newOrganization}`);
    },
    "updateEmail": async ({ newEmail }) => {
        console.log(`Update email ${newEmail}`);
    },
    "getAllowedEmailRegexp": memoize(async () => "/gouv.fr$/", { "promise": true }),
    "getAllOrganizations": memoize(async () => ["DINUM", "CNRS", "ESR"], {
        "promise": true
    }),
    "getTotalReferentCount": memoize(async () => ({ "referentCount": 322 }), {
        "promise": true
    }),
    "getRegisteredUserCount": memoize(async () => 500, { "promise": true }),
    "getTermsOfServiceUrl": memoize(
        async () => "https://sill-preprod.lab.sspcloud.fr/readme",
        { "promise": true }
    ),
    "getMarkdown": async ({ language, name }) => `Markdown for ${language} and ${name}`,
    "getAgent": async ({ email }) => ({
        "agent": {
            "about": "About",
            email,
            "organization": "organization",
            "declarations": [],
            "isPublic": false
        }
    }),
    "updateAgentAbout": async ({ about }) => {
        console.log(`Update about ${about}`);
    },
    "getIsAgentProfilePublic": async ({ email }) => ({
        "isPublic": email.startsWith("public")
    }),
    "updateIsAgentProfilePublic": async ({ isPublic }) => {
        console.log(`Update isPublic ${isPublic}`);
    },
    "unreferenceSoftware": async ({ reason }) => {
        console.log(`Unreference software ${reason}`);
    }
};

const options = [
    {
        "wikidataId": "Q110492908",
        "label": "Onyxia",
        "description": "A data science oriented container launcher",
        "isInSill": true,
        "isLibreSoftware": true
    },
    {
        "wikidataId": "Q107693197",
        "label": "Keycloakify",
        "description": "Build tool for creating Keycloak themes using React",
        "isInSill": true,
        "isLibreSoftware": true
    },
    {
        "wikidataId": "Q8038",
        "description": "image retouching and editing tool",
        "label": "GIMP",
        "isInSill": true,
        "isLibreSoftware": true
    },
    {
        "wikidataId": "Q10135",
        "description": "office suite supported by the free software community",
        "label": "LibreOffice",
        "isInSill": true,
        "isLibreSoftware": true
    },
    {
        "wikidataId": "Q19841877",
        "description": "source code editor developed by Microsoft",
        "label": "Visual Studio Code",
        "isInSill": true,
        "isLibreSoftware": true
    },
    {
        "wikidataId": "Q50938515",
        "description":
            "decentralized video hosting network, based on free/libre software",
        "label": "PeerTube",
        "isInSill": true,
        "isLibreSoftware": true
    }
];

const softwares = [
    id<ApiTypes.Software>({
        "logoUrl": LogoNextCloud,
        "softwareId": 0,
        "softwareName": "NextCloud",
        "codeRepositoryUrl": "https://github.com/nextcloud/server",
        "authors": [],
        "versionMin": "17.0.3",
        "comptoirDuLibreServiceProviderCount": 29,
        "comptoirDuLibreId": 117,
        "annuaireCnllServiceProviders": [],
        "similarSoftwares": [
            {
                "description":
                    "team collaboration and videoconferencing application developed by Microsoft",
                "wikidataId": "Q28406404",
                "label": "Microsoft Teams",
                "isLibreSoftware": false,
                "isInSill": false
            }
        ],
        "wikidataId": "Q25874683",
        "license": "AGPL-3.0-or-later",
        "officialWebsiteUrl": undefined,
        "softwareDescription":
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras feugiat, ex sit amet pretium blandit, tortor eros dapibus sem, ultricies tempor nunc magna in dolor. Curabitur non tincidunt ex. Nulla facilisi. Integer vestibulum ultricies risus eu blandit. Duis accumsan dolor sit amet arcu semper ultrices. Cras tincidunt commodo mauris quis iaculis. Morbi iaculis massa sit amet nunc porttitor malesuada. Sed venenatis congue dolor eu posuere. Praesent nec pulvinar massa. Ut id diam congue, elementum nulla in, varius mi.",
        "latestVersion": undefined,
        "parentWikidataSoftware": undefined,
        "testUrl": undefined,
        "addedTime": 1670416144,
        "updateTime": 1674739365178,
        "dereferencing": undefined,
        "categories": ["messaging"],
        "softwareType": {
            "type": "cloud"
        },
        "prerogatives": {
            "doRespectRgaa": false,
            "isFromFrenchPublicServices": false,
            "isPresentInSupportContract": true
        },
        "userAndReferentCountByOrganization": {
            "CA du Puy-en-Velay": { "referentCount": 0, "userCount": 1 },
            "CC Pays de Pouzauges": { "referentCount": 1, "userCount": 0 },
            "DINUM": { "referentCount": 2, "userCount": 43 }
        },
        "keywords": []
    }),
    id<ApiTypes.Software>({
        "logoUrl": LogoLibreOffice,
        "softwareId": 1,
        "softwareName": "LibreOffice",
        "codeRepositoryUrl": undefined,
        "authors": [
            {
                "authorName": "TDF",
                "authorUrl": "https://www.wikidata.org/wiki/Q313103"
            }
        ],
        "versionMin": "17.0.3",
        "comptoirDuLibreServiceProviderCount": 22,
        "comptoirDuLibreId": 33,
        "annuaireCnllServiceProviders": [],
        "similarSoftwares": [
            {
                "description":
                    "team collaboration and videoconferencing application developed by Microsoft",
                "wikidataId": "Q28406404",
                "label": "Microsoft Teams",
                "isLibreSoftware": false,
                "isInSill": false
            }
        ],
        "wikidataId": "Q10135",
        "license": "MPL-2.0",
        "officialWebsiteUrl": "https://www.libreoffice.org/",
        "softwareDescription":
            "LibreOffice, Suite bureautique (logiciel de traitement de texte, tableur ect)",
        "latestVersion": {
            "semVer": "10.1.3",
            "publicationTime": 1670503742
        },
        "parentWikidataSoftware": undefined,
        "testUrl": undefined,
        "addedTime": 1674739365178,
        "updateTime": 1674739365178,
        "dereferencing": undefined,
        "categories": ["traitement de texte"],
        "prerogatives": {
            "doRespectRgaa": true,
            "isFromFrenchPublicServices": true,
            "isPresentInSupportContract": true
        },
        "softwareType": {
            "type": "desktop/mobile",
            "os": {
                "linux": true,
                "mac": true,
                "windows": true,
                "android": true,
                "ios": true
            }
        },
        "userAndReferentCountByOrganization": {
            "CA du Puy-en-Velay": { "referentCount": 1, "userCount": 0 }
        },
        "keywords": []
    }),
    id<ApiTypes.Software>({
        "logoUrl": undefined,
        "softwareId": 2,
        "softwareName": "ARX Data Anonymization Tool",
        "codeRepositoryUrl": "https://core.trac.wordpress.org/browser",
        "authors": [
            {
                "authorName": "Matt Mullenweg",
                "authorUrl": "https://www.wikidata.org/wiki/Q92877"
            },
            {
                "authorName": "Mike Little",
                "authorUrl": "https://www.wikidata.org/wiki/Q16731558"
            },
            {
                "authorName": "Automattic",
                "authorUrl": "https://www.wikidata.org/wiki/Q2872634"
            }
        ],
        "versionMin": "Dernière stable",
        "comptoirDuLibreServiceProviderCount": 24,
        "comptoirDuLibreId": 38,
        "annuaireCnllServiceProviders": [],
        "similarSoftwares": [],
        "wikidataId": "Q10135",
        "softwareType": {
            "type": "cloud"
        },
        "license": "MPL-2.0",
        "officialWebsiteUrl": "https://wordpress.org/",
        "softwareDescription": "Wordpress, Système de gestion de contenus web",
        "latestVersion": {
            "semVer": "Dernière stable",
            "publicationTime": 1667911742
        },
        "parentWikidataSoftware": undefined,
        "testUrl": undefined,
        "addedTime": 1674739365178,
        "updateTime": 1674739365178,
        "dereferencing": undefined,
        "categories": ["cloud", "software"],
        "prerogatives": {
            "doRespectRgaa": false,
            "isFromFrenchPublicServices": false,
            "isPresentInSupportContract": false
        },
        "userAndReferentCountByOrganization": {
            "CA du Puy-en-Velay": { "referentCount": 0, "userCount": 1 },
            "CC Pays de Pouzauges": { "referentCount": 1, "userCount": 0 },
            "DINUM": { "referentCount": 2, "userCount": 43 }
        },
        "keywords": []
    }),
    id<ApiTypes.Software>({
        "logoUrl": undefined,
        "softwareId": 3,
        "softwareName": "VLC",
        "codeRepositoryUrl": "https://code.videolan.org/videolan/vlc",
        "authors": [
            {
                "authorName": "VideoLAN",
                "authorUrl": "https://www.wikidata.org/wiki/Q1282963"
            },
            {
                "authorName": "Jean-Baptiste Kempf",
                "authorUrl": "https://www.wikidata.org/wiki/Q58879462"
            }
        ],
        "versionMin": "Dernière stable",
        "comptoirDuLibreServiceProviderCount": 5,
        "comptoirDuLibreId": 62,
        "annuaireCnllServiceProviders": [],
        "similarSoftwares": [],
        "wikidataId": "Q171477",
        "license": "GPL-2.0-only",
        "officialWebsiteUrl": "https://www.wikidata.org/wiki/Q171477",
        "softwareDescription": "VLC, Lecteur multimédia",
        "latestVersion": {
            "semVer": "Dernière stable",
            "publicationTime": 1665233342
        },
        "parentWikidataSoftware": undefined,
        "softwareType": {
            "type": "desktop/mobile",
            "os": {
                "linux": true,
                "mac": true,
                "windows": true,
                "android": true,
                "ios": true
            }
        },
        "testUrl": undefined,
        "addedTime": 1674739365178,
        "updateTime": 1674739365178,
        "dereferencing": undefined,
        "categories": ["player"],
        "prerogatives": {
            "doRespectRgaa": false,
            "isFromFrenchPublicServices": false,
            "isPresentInSupportContract": false
        },
        "userAndReferentCountByOrganization": {},
        "keywords": []
    }),
    id<ApiTypes.Software>({
        "logoUrl": undefined,
        "softwareId": 4,
        "softwareName": "Debian",
        "codeRepositoryUrl": "https://sources.debian.org/",
        "authors": [
            {
                "authorName": "The Debian Project",
                "authorUrl": "https://www.wikidata.org/wiki/Q55966784"
            }
        ],
        "versionMin": "10",
        "comptoirDuLibreServiceProviderCount": 16,
        "comptoirDuLibreId": 241,
        "annuaireCnllServiceProviders": [],
        "similarSoftwares": [
            {
                "description":
                    "team collaboration and videoconferencing application developed by Microsoft",
                "wikidataId": "Q28406404",
                "label": "Microsoft Teams",
                "isLibreSoftware": false,
                "isInSill": false
            }
        ],
        "wikidataId": "Q7715973",
        "license": "N/A",
        "officialWebsiteUrl": "https://www.debian.org/",
        "softwareDescription": "Debian, Distribution GNU/LINUX",
        "latestVersion": {
            "semVer": "Dernière stable",
            "publicationTime": 1633524542
        },
        "parentWikidataSoftware": undefined,
        "softwareType": {
            "type": "stack"
        },
        "testUrl": undefined,
        "addedTime": 1674739365178,
        "updateTime": 1674739365178,
        "dereferencing": undefined,
        "categories": ["cloud"],
        "prerogatives": {
            "doRespectRgaa": false,
            "isFromFrenchPublicServices": false,
            "isPresentInSupportContract": false
        },
        "userAndReferentCountByOrganization": {
            "CA du Puy-en-Velay": { "referentCount": 0, "userCount": 1 },
            "CC Pays de Pouzauges": { "referentCount": 1, "userCount": 0 },
            "DINUM": { "referentCount": 2, "userCount": 43 }
        },
        "keywords": []
    }),
    id<ApiTypes.Software>({
        "logoUrl": undefined,
        "softwareId": 5,
        "softwareName": "Thunderbird",
        "codeRepositoryUrl": "https://hg.mozilla.org/comm-central",
        "authors": [
            {
                "authorName": "MZLA Technologies Corporation",
                "authorUrl": "https://www.wikidata.org/wiki/Q90137272"
            },
            {
                "authorName": "Mozilla Foundation",
                "authorUrl": "https://www.wikidata.org/wiki/Q55672"
            },
            {
                "authorName": "Mozilla Messaging",
                "authorUrl": "https://www.wikidata.org/wiki/Q1370678"
            }
        ],
        "versionMin": "68",
        "comptoirDuLibreServiceProviderCount": 9,
        "comptoirDuLibreId": 80,
        "annuaireCnllServiceProviders": [],
        "wikidataId": "Q483604",
        "license": "MPL-2.0",
        "officialWebsiteUrl": "https://www.thunderbird.net/",
        "softwareDescription": "Thunderbird, Courrielleur",
        "latestVersion": {
            "semVer": "Dernière stable",
            "publicationTime": 1633524542
        },
        "parentWikidataSoftware": undefined,
        "softwareType": {
            "type": "desktop/mobile",
            "os": {
                "linux": true,
                "windows": true,
                "mac": true,
                "android": true,
                "ios": true
            }
        },
        "similarSoftwares": [
            {
                "description":
                    "team collaboration and videoconferencing application developed by Microsoft",
                "wikidataId": "Q28406404",
                "label": "Microsoft Teams",
                "isLibreSoftware": false,
                "isInSill": false
            }
        ],
        "testUrl": undefined,
        "addedTime": 1674739365178,
        "updateTime": 1674739365178,
        "dereferencing": undefined,
        "categories": ["cloud"],
        "prerogatives": {
            "doRespectRgaa": false,
            "isFromFrenchPublicServices": false,
            "isPresentInSupportContract": false
        },
        "userAndReferentCountByOrganization": {
            "CA du Puy-en-Velay": { "referentCount": 0, "userCount": 1 },
            "CC Pays de Pouzauges": { "referentCount": 1, "userCount": 0 },
            "DINUM": { "referentCount": 2, "userCount": 43 }
        },
        "keywords": []
    }),
    id<ApiTypes.Software>({
        "logoUrl": undefined,
        "softwareId": 6,
        "softwareName": "Qgis",
        "codeRepositoryUrl": "https://github.com/qgis/QGIS",
        "authors": [
            {
                "authorName": "QGIS Development Team",
                "authorUrl": "https://www.wikidata.org/wiki/Q15952356"
            }
        ],
        "versionMin": "3.16",
        "comptoirDuLibreServiceProviderCount": 14,
        "comptoirDuLibreId": 60,
        "annuaireCnllServiceProviders": [],
        "similarSoftwares": [],
        "wikidataId": "Q1329181",
        "license": "GPL-2.0-or-later",
        "officialWebsiteUrl": "https://qgis.org/fr/site/",
        "softwareDescription": "Qgis, Système d'information géographique",
        "latestVersion": {
            "semVer": "Dernière stable",
            "publicationTime": 1633524542
        },
        "testUrl": undefined,
        "softwareType": {
            "type": "desktop/mobile",
            "os": {
                "linux": true,
                "mac": true,
                "windows": true,
                "android": true,
                "ios": true
            }
        },
        "parentWikidataSoftware": undefined,
        "addedTime": 1674739365178,
        "updateTime": 1674739365178,
        "dereferencing": undefined,
        "categories": ["cloud"],
        "prerogatives": {
            "doRespectRgaa": false,
            "isFromFrenchPublicServices": false,
            "isPresentInSupportContract": false
        },
        "userAndReferentCountByOrganization": {
            "CA du Puy-en-Velay": { "referentCount": 0, "userCount": 1 },
            "DINUM": { "referentCount": 2, "userCount": 43 }
        },
        "keywords": []
    }),
    id<ApiTypes.Software>({
        "logoUrl": undefined,
        "softwareId": 7,
        "softwareName": "Mozilla Firefox",
        "codeRepositoryUrl": "https://hg.mozilla.org/mozilla-central/",
        "authors": [
            {
                "authorName": "Mozilla Foundation",
                "authorUrl": "https://www.wikidata.org/wiki/Q55672"
            },
            {
                "authorName": "Dave Hyatt",
                "authorUrl": "https://www.wikidata.org/wiki/Q558130"
            },
            {
                "authorName": "Joe Hewitt",
                "authorUrl": "https://www.wikidata.org/wiki/Q4502689"
            },
            {
                "authorName": "Blake Ross",
                "authorUrl": "https://www.wikidata.org/wiki/Q92792"
            },
            {
                "authorName": "Mozilla Corporation",
                "authorUrl": "https://www.wikidata.org/wiki/Q169925"
            }
        ],
        "versionMin": "3.16",
        "comptoirDuLibreServiceProviderCount": 3,
        "comptoirDuLibreId": 82,
        "annuaireCnllServiceProviders": [],
        "wikidataId": "Q698",
        "license": "MPL-2.0",
        "officialWebsiteUrl": "https://www.mozilla.org/fr/firefox/new/",
        "softwareDescription": "Mozilla Firefox (Extended Support Release), Navigateur",
        "latestVersion": {
            "semVer": "Dernière stable",
            "publicationTime": 1633524542
        },
        "parentWikidataSoftware": undefined,
        "testUrl": undefined,
        "addedTime": 1674739365178,
        "updateTime": 1674739365178,
        "dereferencing": undefined,
        "categories": ["cloud"],
        "prerogatives": {
            "doRespectRgaa": false,
            "isFromFrenchPublicServices": false,
            "isPresentInSupportContract": false
        },
        "softwareType": {
            "type": "desktop/mobile",
            "os": {
                "linux": true,
                "mac": true,
                "windows": true,
                "android": true,
                "ios": true
            }
        },
        "similarSoftwares": [],
        "userAndReferentCountByOrganization": {
            "DINUM": { "referentCount": 2, "userCount": 43 }
        },
        "keywords": []
    }),
    id<ApiTypes.Software>({
        "logoUrl": LogoNeovim,
        "softwareId": 8,
        "softwareName": "PostgreSQL",
        "codeRepositoryUrl": "https://git.postgresql.org/gitweb/?p=postgresql.git",
        "authors": [
            {
                "authorName": "Michael Stonebraker",
                "authorUrl": "https://www.wikidata.org/wiki/Q92758"
            },
            {
                "authorName": "PostgreSQL Global Development Group",
                "authorUrl": "https://www.wikidata.org/wiki/Q65807102"
            }
        ],
        "versionMin": "10",
        "comptoirDuLibreServiceProviderCount": 17,
        "comptoirDuLibreId": 123,
        "annuaireCnllServiceProviders": [],
        "similarSoftwares": [],
        "wikidataId": "Q192490",
        "license": "PostgreSQL",
        "officialWebsiteUrl": "https://www.postgresql.org/",
        "softwareDescription": "PostgreSQL, Base de données transactionnelle",
        "latestVersion": {
            "semVer": "Dernière stable",
            "publicationTime": 1633524542
        },
        "parentWikidataSoftware": undefined,
        "testUrl": undefined,
        "addedTime": 1674739365178,
        "updateTime": 1674739365178,
        "dereferencing": undefined,
        "categories": ["cloud"],
        "softwareType": {
            "type": "stack"
        },
        "prerogatives": {
            "doRespectRgaa": false,
            "isFromFrenchPublicServices": false,
            "isPresentInSupportContract": false
        },
        "userAndReferentCountByOrganization": {
            "CA du Puy-en-Velay": { "referentCount": 0, "userCount": 1 }
        },
        "keywords": []
    }),
    id<ApiTypes.Software>({
        "logoUrl": LogoWordpress,
        "softwareId": 9,
        "softwareName": "Peertube",
        "codeRepositoryUrl": "https://github.com/Chocobozzz/PeerTube",
        "authors": [
            {
                "authorName": "Framasoft",
                "authorUrl": "https://www.wikidata.org/wiki/Q3080414"
            }
        ],
        "versionMin": "3.x",
        "comptoirDuLibreServiceProviderCount": 5,
        "comptoirDuLibreId": 140,
        "annuaireCnllServiceProviders": [],
        "similarSoftwares": [],
        "wikidataId": "Q50938515",
        "license": "AGPL-3.0-or-later",
        "officialWebsiteUrl": "https://joinpeertube.org/",
        "softwareDescription":
            "Peertube, Plateforme d'hébergement décentralisée de vidéos",
        "latestVersion": {
            "semVer": "Dernière stable",
            "publicationTime": 1633524542
        },
        "parentWikidataSoftware": undefined,
        "softwareType": {
            "type": "cloud"
        },
        "testUrl": undefined,
        "addedTime": 1674739365178,
        "updateTime": 1674739365178,
        "dereferencing": undefined,
        "categories": ["cloud"],
        "prerogatives": {
            "doRespectRgaa": false,
            "isFromFrenchPublicServices": false,
            "isPresentInSupportContract": false
        },
        "userAndReferentCountByOrganization": {
            "CA du Puy-en-Velay": { "referentCount": 0, "userCount": 1 },
            "CC Pays de Pouzauges": { "referentCount": 1, "userCount": 0 },
            "DINUM": { "referentCount": 2, "userCount": 43 }
        },
        "keywords": []
    }),
    id<ApiTypes.Software>({
        "logoUrl": LogoLibreOffice,
        "softwareId": 10,
        "softwareName": "Archifiltre",
        "codeRepositoryUrl": "https://github.com/SocialGouv/archifiltre-docs",
        "authors": [],
        "versionMin": "2.0.x",
        "comptoirDuLibreServiceProviderCount": 1,
        "comptoirDuLibreId": 368,
        "annuaireCnllServiceProviders": [],
        "wikidataId": "Q77064547",
        "license": "MIT",
        "officialWebsiteUrl": "https://archifiltre.fabrique.social.gouv.fr/",
        "softwareDescription": "Archifiltre, Système d'aide à l'archivage de fichiers",
        "latestVersion": {
            "semVer": "Dernière stable",
            "publicationTime": 1633524542
        },
        "parentWikidataSoftware": undefined,
        "softwareType": {
            "type": "desktop/mobile",
            "os": {
                "linux": true,
                "mac": true,
                "windows": true,
                "android": true,
                "ios": true
            }
        },
        "similarSoftwares": [],
        "testUrl": undefined,
        "addedTime": 1674739365178,
        "updateTime": 1674739365178,
        "dereferencing": undefined,
        "categories": ["cloud"],
        "prerogatives": {
            "doRespectRgaa": false,
            "isFromFrenchPublicServices": false,
            "isPresentInSupportContract": false
        },
        "userAndReferentCountByOrganization": {},
        "keywords": []
    }),
    id<ApiTypes.Software>({
        "logoUrl": LogoLibreOffice,
        "softwareId": 11,
        "softwareName": "Synfig",
        "codeRepositoryUrl": "https://github.com/SocialGouv/archifiltre-docs",
        "authors": [],
        "versionMin": "2.0.x",
        "comptoirDuLibreServiceProviderCount": 1,
        "comptoirDuLibreId": 368,
        "annuaireCnllServiceProviders": [],
        "wikidataId": "Q77064547",
        "license": "MIT",
        "officialWebsiteUrl": "https://archifiltre.fabrique.social.gouv.fr/",
        "softwareDescription": "Archifiltre, Système d'aide à l'archivage de fichiers",
        "latestVersion": {
            "semVer": "Dernière stable",
            "publicationTime": 1633524542
        },
        "parentWikidataSoftware": undefined,
        "softwareType": {
            "type": "desktop/mobile",
            "os": {
                "linux": true,
                "mac": true,
                "windows": true,
                "android": true,
                "ios": true
            }
        },
        "similarSoftwares": [],
        "testUrl": undefined,
        "addedTime": 1674739365178,
        "updateTime": 1674739365178,
        "dereferencing": undefined,
        "categories": ["cloud"],
        "prerogatives": {
            "doRespectRgaa": false,
            "isFromFrenchPublicServices": false,
            "isPresentInSupportContract": false
        },
        "userAndReferentCountByOrganization": {},
        "keywords": []
    }),
    id<ApiTypes.Software>({
        "logoUrl": LogoLibreOffice,
        "softwareId": 12,
        "softwareName": "StackStorm",
        "codeRepositoryUrl": "https://github.com/SocialGouv/archifiltre-docs",
        "authors": [],
        "versionMin": "2.0.x",
        "comptoirDuLibreServiceProviderCount": 1,
        "comptoirDuLibreId": 368,
        "annuaireCnllServiceProviders": [],
        "wikidataId": "Q77064547",
        "license": "MIT",
        "officialWebsiteUrl": "https://archifiltre.fabrique.social.gouv.fr/",
        "softwareDescription": "Archifiltre, Système d'aide à l'archivage de fichiers",
        "latestVersion": {
            "semVer": "Dernière stable",
            "publicationTime": 1633524542
        },
        "parentWikidataSoftware": undefined,
        "softwareType": {
            "type": "desktop/mobile",
            "os": {
                "linux": true,
                "mac": true,
                "windows": true,
                "android": true,
                "ios": true
            }
        },
        "similarSoftwares": [],
        "testUrl": undefined,
        "addedTime": 1674739365178,
        "updateTime": 1674739365178,
        "dereferencing": undefined,
        "categories": ["cloud"],
        "prerogatives": {
            "doRespectRgaa": false,
            "isFromFrenchPublicServices": false,
            "isPresentInSupportContract": false
        },
        "userAndReferentCountByOrganization": {},
        "keywords": []
    }),
    id<ApiTypes.Software>({
        "logoUrl": LogoLibreOffice,
        "softwareId": 13,
        "softwareName": "restic",
        "codeRepositoryUrl": "https://github.com/SocialGouv/archifiltre-docs",
        "authors": [],
        "versionMin": "2.0.x",
        "comptoirDuLibreServiceProviderCount": 1,
        "comptoirDuLibreId": 368,
        "annuaireCnllServiceProviders": [],
        "wikidataId": "Q77064547",
        "license": "MIT",
        "officialWebsiteUrl": "https://archifiltre.fabrique.social.gouv.fr/",
        "softwareDescription": "Archifiltre, Système d'aide à l'archivage de fichiers",
        "latestVersion": {
            "semVer": "Dernière stable",
            "publicationTime": 1633524542
        },
        "parentWikidataSoftware": undefined,
        "softwareType": {
            "type": "desktop/mobile",
            "os": {
                "linux": true,
                "mac": true,
                "windows": true,
                "android": true,
                "ios": true
            }
        },
        "similarSoftwares": [],
        "testUrl": undefined,
        "addedTime": 1674739365178,
        "updateTime": 1674739365178,
        "dereferencing": undefined,
        "categories": ["cloud"],
        "prerogatives": {
            "doRespectRgaa": false,
            "isFromFrenchPublicServices": false,
            "isPresentInSupportContract": false
        },
        "userAndReferentCountByOrganization": {},
        "keywords": []
    }),
    id<ApiTypes.Software>({
        "logoUrl": LogoLibreOffice,
        "softwareId": 14,
        "softwareName": "Khartis",
        "codeRepositoryUrl": "https://github.com/SocialGouv/archifiltre-docs",
        "authors": [],
        "versionMin": "2.0.x",
        "comptoirDuLibreServiceProviderCount": 1,
        "comptoirDuLibreId": 368,
        "annuaireCnllServiceProviders": [],
        "wikidataId": "Q77064547",
        "license": "MIT",
        "officialWebsiteUrl": "https://archifiltre.fabrique.social.gouv.fr/",
        "softwareDescription": "Archifiltre, Système d'aide à l'archivage de fichiers",
        "latestVersion": {
            "semVer": "Dernière stable",
            "publicationTime": 1633524542
        },
        "parentWikidataSoftware": undefined,
        "softwareType": {
            "type": "desktop/mobile",
            "os": {
                "linux": true,
                "mac": true,
                "windows": true,
                "android": true,
                "ios": true
            }
        },
        "similarSoftwares": [],
        "testUrl": undefined,
        "addedTime": 1674739365178,
        "updateTime": 1674739365178,
        "dereferencing": undefined,
        "categories": ["cloud"],
        "prerogatives": {
            "doRespectRgaa": false,
            "isFromFrenchPublicServices": false,
            "isPresentInSupportContract": false
        },
        "userAndReferentCountByOrganization": {},
        "keywords": []
    }),
    id<ApiTypes.Software>({
        "logoUrl": LogoLibreOffice,
        "softwareId": 15,
        "softwareName": "Penpot",
        "codeRepositoryUrl": "https://github.com/SocialGouv/archifiltre-docs",
        "authors": [],
        "versionMin": "2.0.x",
        "comptoirDuLibreServiceProviderCount": 1,
        "comptoirDuLibreId": 368,
        "annuaireCnllServiceProviders": [],
        "wikidataId": "Q77064547",
        "license": "MIT",
        "officialWebsiteUrl": "https://archifiltre.fabrique.social.gouv.fr/",
        "softwareDescription": "Archifiltre, Système d'aide à l'archivage de fichiers",
        "latestVersion": {
            "semVer": "Dernière stable",
            "publicationTime": 1633524542
        },
        "parentWikidataSoftware": undefined,
        "softwareType": {
            "type": "desktop/mobile",
            "os": {
                "linux": true,
                "mac": true,
                "windows": true,
                "android": true,
                "ios": true
            }
        },
        "similarSoftwares": [],
        "testUrl": undefined,
        "addedTime": 1674739365178,
        "updateTime": 1674739365178,
        "dereferencing": undefined,
        "categories": ["cloud"],
        "prerogatives": {
            "doRespectRgaa": false,
            "isFromFrenchPublicServices": false,
            "isPresentInSupportContract": false
        },
        "userAndReferentCountByOrganization": {},
        "keywords": []
    }),
    id<ApiTypes.Software>({
        "logoUrl": LogoLibreOffice,
        "softwareId": 16,
        "softwareName": "Zabbix",
        "codeRepositoryUrl": "https://github.com/SocialGouv/archifiltre-docs",
        "authors": [],
        "versionMin": "2.0.x",
        "annuaireCnllServiceProviders": [],
        "comptoirDuLibreServiceProviderCount": 1,
        "comptoirDuLibreId": 368,
        "wikidataId": "Q77064547",
        "license": "MIT",
        "officialWebsiteUrl": "https://archifiltre.fabrique.social.gouv.fr/",
        "softwareDescription": "Archifiltre, Système d'aide à l'archivage de fichiers",
        "latestVersion": {
            "semVer": "Dernière stable",
            "publicationTime": 1633524542
        },
        "parentWikidataSoftware": undefined,
        "softwareType": {
            "type": "desktop/mobile",
            "os": {
                "linux": true,
                "mac": true,
                "windows": true,
                "android": true,
                "ios": true
            }
        },
        "similarSoftwares": [],
        "testUrl": undefined,
        "addedTime": 1674739365178,
        "updateTime": 1674739365178,
        "dereferencing": undefined,
        "categories": ["cloud"],
        "prerogatives": {
            "doRespectRgaa": false,
            "isFromFrenchPublicServices": false,
            "isPresentInSupportContract": false
        },
        "userAndReferentCountByOrganization": {},
        "keywords": []
    }),
    id<ApiTypes.Software>({
        "logoUrl": LogoLibreOffice,
        "softwareId": 17,
        "softwareName": "CodeIgniter",
        "codeRepositoryUrl": "https://github.com/SocialGouv/archifiltre-docs",
        "authors": [],
        "versionMin": "2.0.x",
        "annuaireCnllServiceProviders": [],
        "comptoirDuLibreServiceProviderCount": 1,
        "comptoirDuLibreId": 368,
        "wikidataId": "Q77064547",
        "license": "MIT",
        "officialWebsiteUrl": "https://archifiltre.fabrique.social.gouv.fr/",
        "softwareDescription": "Archifiltre, Système d'aide à l'archivage de fichiers",
        "latestVersion": {
            "semVer": "Dernière stable",
            "publicationTime": 1633524542
        },
        "parentWikidataSoftware": undefined,
        "softwareType": {
            "type": "desktop/mobile",
            "os": {
                "linux": true,
                "mac": true,
                "windows": true,
                "android": true,
                "ios": true
            }
        },
        "similarSoftwares": [],
        "testUrl": undefined,
        "addedTime": 1674739365178,
        "updateTime": 1674739365178,
        "dereferencing": undefined,
        "categories": ["cloud"],
        "prerogatives": {
            "doRespectRgaa": false,
            "isFromFrenchPublicServices": false,
            "isPresentInSupportContract": false
        },
        "userAndReferentCountByOrganization": {},
        "keywords": []
    })
];

const agents: ApiTypes.Agent[] = [
    {
        "organization": "Développement durable",
        "email": "agent1@codegouv.fr",
        "declarations": [
            {
                "serviceUrl": "",
                "declarationType": "user",
                "os": "windows",
                "softwareName": "LibreOffice",
                "version": "1.1.1",
                "usecaseDescription": "Usecase description"
            }
        ]
    },
    {
        "organization": "Babel",
        "email": "agent2@codegouv.fr",
        "declarations": [
            {
                "serviceUrl": "",
                "declarationType": "referent",
                "softwareName": "LibreOffice",
                "isTechnicalExpert": true,
                "usecaseDescription": "Usecase description"
            }
        ]
    },
    {
        "organization": "Éducation nationale",
        "email": "agent3@codegouv.fr",
        "declarations": [
            {
                "serviceUrl": "",
                "declarationType": "referent",
                "softwareName": "LibreOffice",
                "isTechnicalExpert": true,
                "usecaseDescription": "Usecase description"
            }
        ]
    }
];
