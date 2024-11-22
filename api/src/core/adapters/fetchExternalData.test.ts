import { Kysely, sql } from "kysely";
import { describe, it, beforeEach, expect } from "vitest";
import { expectToEqual, expectToMatchObject, testPgUrl } from "../../tools/test.helpers";
import { DbApiV2 } from "../ports/DbApiV2";
import { SoftwareFormData } from "../usecases/readWriteSillData";
import { comptoirDuLibreApi } from "./comptoirDuLibreApi";
import { createKyselyPgDbApi } from "./dbApi/kysely/createPgDbApi";
import type { Database } from "./dbApi/kysely/kysely.database";
import { createPgDialect } from "./dbApi/kysely/kysely.dialect";
import { makeFetchAndSaveSoftwareExtraData } from "./fetchExternalData";
import { getCnllPrestatairesSill } from "./getCnllPrestatairesSill";
import { getServiceProviders } from "./getServiceProviders";
import { createGetSoftwareLatestVersion } from "./getSoftwareLatestVersion";
import { getWikidataSoftware } from "./wikidata/getWikidataSoftware";

const craSoftwareFormData = {
    softwareType: {
        type: "stack"
    },
    externalId: "Q118629387",
    comptoirDuLibreId: 1,
    softwareName: "Create react app",
    softwareDescription: "To create React apps.",
    softwareLicense: "MIT",
    softwareMinimalVersion: "1.0.0",
    isPresentInSupportContract: true,
    isFromFrenchPublicService: true,
    similarSoftwareExternalDataIds: ["Q111590996" /* viteJS */],
    softwareLogoUrl: "https://example.com/logo.png",
    softwareKeywords: ["Productivity", "Task", "Management"],
    doRespectRgaa: true
} satisfies SoftwareFormData;

const apacheSoftwareId = 6;

const insertApacheWithCorrectId = async (db: Kysely<Database>, agentId: number) => {
    await sql`
      INSERT INTO public.softwares
      (id, "softwareType", "externalId", "externalDataOrigin",
       "comptoirDuLibreId", name, description, license, "versionMin",
       "isPresentInSupportContract", "isFromFrenchPublicService", "logoUrl",
       keywords, "doRespectRgaa", "isStillInObservation",
       "parentSoftwareWikidataId", "catalogNumeriqueGouvFrId", "workshopUrls",
       "testUrls", categories, "generalInfoMd", "addedByAgentId",
       dereferencing, "referencedSinceTime", "updateTime")
      VALUES (${apacheSoftwareId},
              '{"os": {"ios": false, "mac": false, "linux": true, "android": false, "windows": false}, "type": "desktop/mobile"}',
              'Q11354', 'wikidata', 3737, 'Apache HTTP Server',
              'Serveur Web & Reverse Proxy', 'Apache-2.0', '212', true, false,
              'https://sill.code.gouv.fr/logo/apache-http.png',
              '["serveur", "http", "web", "server", "apache"]', false, false,
              null, null, '[]', '[]', '[]', null, ${agentId}, null,
              1728462232094,
              1728462232094);
  `.execute(db);
};

const acceleroId = 2;
const insertAcceleroWithCorrectId = async (db: Kysely<Database>, agentId: number) => {
    await sql`
      INSERT INTO softwares (id, "softwareType", "externalId",
                                    "externalDataOrigin", "comptoirDuLibreId",
                                    name, description, license, "versionMin",
                                    "isPresentInSupportContract",
                                    "isFromFrenchPublicService", "logoUrl",
                                    keywords, "doRespectRgaa",
                                    "isStillInObservation",
                                    "parentSoftwareWikidataId",
                                    "catalogNumeriqueGouvFrId",
                                    "workshopUrls", "testUrls", categories,
                                    "generalInfoMd", "addedByAgentId",
                                    dereferencing, "referencedSinceTime",
                                    "updateTime")
      VALUES (${acceleroId}, '{"type": "stack"}', 'Q2822666', 'wikidata', 304,
              'Acceleo',
              'Outil et/ou plugin de génération de tout ou partie du code',
              'EPL-2.0', '3.7.8', false, false, null,
              '["modélisation", "génération", "code", "modeling", "code generation"]',
              false, false, null, null, '[]', '[]',
              '["Other Development Tools"]', null, ${agentId}, null,
              1514764800000,
              1514764800000);
  `.execute(db);
    return acceleroId;
};

describe("fetches software extra data (from different providers)", () => {
    let fetchAndSaveSoftwareExtraData: ReturnType<typeof makeFetchAndSaveSoftwareExtraData>;
    let dbApi: DbApiV2;
    let db: Kysely<Database>;
    let craSoftwareId: number;

    beforeEach(async () => {
        db = new Kysely<Database>({ dialect: createPgDialect(testPgUrl) });
        await db.deleteFrom("compiled_softwares").execute();
        await db.deleteFrom("software_external_datas").execute();
        await db.deleteFrom("software_users").execute();
        await db.deleteFrom("software_referents").execute();
        await db.deleteFrom("softwares").execute();
        await db.deleteFrom("agents").execute();

        await sql`SELECT setval('softwares_id_seq', 11, false)`.execute(db);

        dbApi = createKyselyPgDbApi(db);

        const agentId = await dbApi.agent.add({
            email: "myuser@example.com",
            organization: "myorg",
            about: "my about",
            isPublic: false
        });

        craSoftwareId = await dbApi.software.create({
            formData: craSoftwareFormData,
            externalDataOrigin: "wikidata",
            agentId
        });

        await insertApacheWithCorrectId(db, agentId);
        await insertAcceleroWithCorrectId(db, agentId);

        const { getSoftwareLatestVersion } = createGetSoftwareLatestVersion({
            githubPersonalAccessTokenForApiRateLimit: ""
        });

        fetchAndSaveSoftwareExtraData = makeFetchAndSaveSoftwareExtraData({
            dbApi,
            getSoftwareExternalData: getWikidataSoftware,
            comptoirDuLibreApi,
            getCnllPrestatairesSill: getCnllPrestatairesSill,
            getServiceProviders: getServiceProviders,
            getSoftwareLatestVersion
        });
    });

    it("does nothing if the software is not found", async () => {
        const softwareExternalDatas = await db.selectFrom("software_external_datas").selectAll().execute();
        expectToEqual(softwareExternalDatas, []);

        await fetchAndSaveSoftwareExtraData(404, {});

        const updatedSoftwareExternalDatas = await db.selectFrom("software_external_datas").selectAll().execute();
        expectToEqual(updatedSoftwareExternalDatas, []);
    });

    it("fetches correctly the logoUrl from comptoir du libre", async () => {
        const softwareExternalDatas = await db.selectFrom("software_external_datas").selectAll().execute();
        expectToEqual(softwareExternalDatas, []);

        await fetchAndSaveSoftwareExtraData(acceleroId, {});

        const results = await db.selectFrom("compiled_softwares").select("comptoirDuLibreSoftware").execute();
        expect(results).toHaveLength(1);
        expectToMatchObject(results[0]!.comptoirDuLibreSoftware, {
            name: "Acceleo",
            logoUrl: "https://comptoir-du-libre.org//img/files/Softwares/Acceleo/avatar/Acceleo.png"
        });
    });

    it(
        "gets software external data and saves it, and does not save other extra data if there is nothing relevant",
        async () => {
            const softwareExternalDatas = await db.selectFrom("software_external_datas").selectAll().execute();
            expect(softwareExternalDatas).toHaveLength(0);

            const { lastExtraDataFetchAt: initialLastExtraDataFetchAt } = await db
                .selectFrom("softwares")
                .select("lastExtraDataFetchAt")
                .where("id", "=", craSoftwareId)
                .executeTakeFirstOrThrow();
            expect(initialLastExtraDataFetchAt).toBe(null);

            await fetchAndSaveSoftwareExtraData(craSoftwareId, {});

            const updatedSoftwareExternalDatas = await db.selectFrom("software_external_datas").selectAll().execute();
            expectToEqual(updatedSoftwareExternalDatas, [
                {
                    applicationCategories: null,
                    description: "A framwork for creating react SPA that uses webpack as bundler",
                    developers: [],
                    documentationUrl: null,
                    externalDataOrigin: "wikidata",
                    externalId: craSoftwareFormData.externalId,
                    framaLibreId: null,
                    isLibreSoftware: true,
                    keywords: [],
                    label: "create-react-app",
                    license: "MIT licence",
                    logoUrl: null,
                    sourceUrl: "https://github.com/facebook/create-react-app",
                    websiteUrl: "https://create-react-app.dev/",
                    programmingLanguages: [],
                    softwareVersion: "5.0.1",
                    publicationTime: new Date("2022-04-12T00:00:00.000Z")
                },
                {
                    applicationCategories: null,
                    description: "open-source JavaScript module bundler",
                    developers: [
                        {
                            id: "Q58482636",
                            name: "Evan You"
                        }
                    ],
                    documentationUrl: "https://vitejs.dev/guide/",
                    externalDataOrigin: "wikidata",
                    externalId: "Q111590996",
                    framaLibreId: null,
                    isLibreSoftware: true,
                    keywords: [],
                    label: "Vite",
                    license: "MIT licence",
                    logoUrl:
                        "//upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Vitejs-logo.svg/220px-Vitejs-logo.svg.png",
                    sourceUrl: "https://github.com/vitejs/vite",
                    websiteUrl: "https://vitejs.dev/",
                    programmingLanguages: ["JavaScript"],
                    softwareVersion: "5.4.10",
                    publicationTime: new Date("2024-10-23T00:00:00.000Z")
                }
            ]);

            const otherExtraData = await db.selectFrom("compiled_softwares").selectAll().execute();
            expectToEqual(otherExtraData, []);

            const { lastExtraDataFetchAt } = await db
                .selectFrom("softwares")
                .select("lastExtraDataFetchAt")
                .where("id", "=", craSoftwareId)
                .executeTakeFirstOrThrow();
            expect(lastExtraDataFetchAt).toBeTruthy();
        },
        { timeout: 10_000 }
    );

    it(
        "gets software external data and saves it, and save other extra data",
        async () => {
            const softwareExternalDatas = await db.selectFrom("software_external_datas").selectAll().execute();
            expect(softwareExternalDatas).toHaveLength(0);

            await fetchAndSaveSoftwareExtraData(apacheSoftwareId, {});

            const updatedSoftwareExternalDatas = await db.selectFrom("software_external_datas").selectAll().execute();
            expectToEqual(updatedSoftwareExternalDatas, [
                {
                    applicationCategories: null,
                    description: {
                        en: "open-source web server software",
                        fr: "serveur web sous licence libre"
                    },
                    developers: [
                        {
                            id: "Q489709",
                            name: "Apache Software Foundation"
                        }
                    ],
                    documentationUrl: null,
                    externalDataOrigin: "wikidata",
                    externalId: "Q11354",
                    framaLibreId: null,
                    isLibreSoftware: false,
                    keywords: [],
                    label: "Apache HTTP Server",
                    license: "Apache License v2.0",
                    logoUrl:
                        "//upload.wikimedia.org/wikipedia/commons/thumb/1/10/Apache_HTTP_server_logo_%282019-present%29.svg/220px-Apache_HTTP_server_logo_%282019-present%29.svg.png",
                    sourceUrl: "https://github.com/apache/httpd",
                    websiteUrl: "https://httpd.apache.org/",
                    programmingLanguages: ["C"],
                    softwareVersion: "2.5.0-alpha",
                    publicationTime: new Date("2017-11-08T00:00:00.000Z")
                }
            ]);

            const otherExtraData = await db.selectFrom("compiled_softwares").selectAll().execute();

            expectToEqual(otherExtraData, [
                {
                    softwareId: apacheSoftwareId,
                    comptoirDuLibreSoftware: null,
                    annuaireCnllServiceProviders: [
                        {
                            url: "https://annuaire.cnll.fr/societes/434940763",
                            name: "YPOK",
                            siren: "434940763"
                        },
                        {
                            url: "https://annuaire.cnll.fr/societes/538420753",
                            name: "INNO3",
                            siren: "538420753"
                        },
                        {
                            url: "https://annuaire.cnll.fr/societes/522588979",
                            name: "COMBODO",
                            siren: "522588979"
                        },
                        {
                            url: "https://annuaire.cnll.fr/societes/452887441",
                            name: "APITUX",
                            siren: "452887441"
                        },
                        {
                            url: "https://annuaire.cnll.fr/societes/820266211",
                            name: "POLLEN ROBOTICS",
                            siren: "820266211"
                        },
                        {
                            url: "https://annuaire.cnll.fr/societes/437827959",
                            name: "ézéo",
                            siren: "437827959"
                        },
                        {
                            url: "https://annuaire.cnll.fr/societes/483494589",
                            name: "CENTREON",
                            siren: "483494589"
                        },
                        {
                            url: "https://annuaire.cnll.fr/societes/524457520",
                            name: "Lan2Net",
                            siren: "524457520"
                        },
                        {
                            url: "https://annuaire.cnll.fr/societes/824429708",
                            name: "WORTEKS",
                            siren: "824429708"
                        },
                        {
                            url: "https://annuaire.cnll.fr/societes/499277713",
                            name: "PLICIWEB SOLUTIONS",
                            siren: "499277713"
                        },
                        {
                            url: "https://annuaire.cnll.fr/societes/450656731",
                            name: "Ryxéo",
                            siren: "450656731"
                        },
                        {
                            url: "https://annuaire.cnll.fr/societes/813965662",
                            name: "DEBAMAX",
                            siren: "813965662"
                        },
                        {
                            url: "https://annuaire.cnll.fr/societes/495075079",
                            name: "Telnowedge",
                            siren: "495075079"
                        },
                        {
                            url: "https://annuaire.cnll.fr/societes/449989573",
                            name: "WebGeoDataVore",
                            siren: "449989573"
                        },
                        {
                            url: "https://annuaire.cnll.fr/societes/490932308",
                            name: "ALTER WAY",
                            siren: "490932308"
                        },
                        {
                            url: "https://annuaire.cnll.fr/societes/443170139",
                            name: "Entr'ouvert",
                            siren: "443170139"
                        },
                        {
                            url: "https://annuaire.cnll.fr/societes/451952295",
                            name: "EVOLIX",
                            siren: "451952295"
                        }
                    ],
                    serviceProviders: [
                        {
                            name: "Oziolab",
                            cdlUrl: "https://comptoir-du-libre.org/fr/users/4075",
                            website: "https://www.oziolab.fr"
                        },
                        {
                            name: "Lan2Net",
                            siren: "524457520",
                            cnllUrl: "https://annuaire.cnll.fr/societes/524457520",
                            website: "https://www.lan2net.fr/",
                            cdlUrl: "https://comptoir-du-libre.org/fr/users/4116"
                        },
                        {
                            name: "DEBAMAX",
                            siren: "813965662",
                            cnllUrl: "https://annuaire.cnll.fr/societes/813965662"
                        },
                        {
                            name: "INNO3",
                            siren: "538420753",
                            cnllUrl: "https://annuaire.cnll.fr/societes/538420753"
                        },
                        {
                            name: "WebGeoDataVore",
                            siren: "449989573",
                            cnllUrl: "https://annuaire.cnll.fr/societes/449989573"
                        },
                        {
                            name: "PLICIWEB SOLUTIONS",
                            siren: "499277713",
                            cnllUrl: "https://annuaire.cnll.fr/societes/499277713"
                        },
                        {
                            name: "Probesys",
                            cdlUrl: "https://comptoir-du-libre.org/fr/users/398",
                            website: "https://www.probesys.com"
                        },
                        {
                            name: "Ionzee",
                            cdlUrl: "https://comptoir-du-libre.org/fr/users/3681",
                            website: ""
                        },
                        {
                            name: "Empreinte Digitale SCOP SA",
                            cdlUrl: "https://comptoir-du-libre.org/fr/users/2225",
                            website: "https://www.empreintedigitale.fr"
                        },
                        {
                            name: "APITUX",
                            siren: "452887441",
                            cnllUrl: "https://annuaire.cnll.fr/societes/452887441"
                        },
                        {
                            name: "CENTREON",
                            siren: "483494589",
                            cnllUrl: "https://annuaire.cnll.fr/societes/483494589"
                        },
                        {
                            name: "Bearstech",
                            cdlUrl: "https://comptoir-du-libre.org/fr/users/3960",
                            website: "https://bearstech.com"
                        },
                        {
                            name: "CIGALL",
                            cdlUrl: "https://comptoir-du-libre.org/fr/users/270",
                            website: "Https://www.cigall.fr"
                        },
                        {
                            name: "ézéo",
                            siren: "437827959",
                            cnllUrl: "https://annuaire.cnll.fr/societes/437827959"
                        },
                        {
                            name: "ALTER WAY",
                            siren: "490932308",
                            cnllUrl: "https://annuaire.cnll.fr/societes/490932308"
                        },
                        {
                            name: "Azure Informatique",
                            cdlUrl: "https://comptoir-du-libre.org/fr/users/3962",
                            website: "https://www.azure-informatique.fr"
                        },
                        {
                            name: "Your Own Net",
                            cdlUrl: "https://comptoir-du-libre.org/fr/users/162",
                            website: "https://yourownnet.net"
                        },
                        {
                            name: "EDISSYUM Consulting",
                            cdlUrl: "https://comptoir-du-libre.org/fr/users/345",
                            website: "http://www.edissyum.com"
                        },
                        {
                            name: "EVOLIX",
                            siren: "451952295",
                            cnllUrl: "https://annuaire.cnll.fr/societes/451952295"
                        },
                        {
                            name: "Talan",
                            cdlUrl: "https://comptoir-du-libre.org/fr/users/4021",
                            website: "https://talan.com"
                        },
                        {
                            name: "Microlinux",
                            cdlUrl: "https://comptoir-du-libre.org/fr/users/295",
                            website: "https://www.microlinux.fr"
                        },
                        {
                            name: "decaris",
                            cdlUrl: "https://comptoir-du-libre.org/fr/users/643",
                            website: "https://mywebdatahome.com"
                        },
                        {
                            name: "SIGMAZ Consilium",
                            cdlUrl: "https://comptoir-du-libre.org/fr/users/3893",
                            website: "https://sigmaz-consilium.fr/"
                        },
                        {
                            name: "Ryxéo",
                            siren: "450656731",
                            cnllUrl: "https://annuaire.cnll.fr/societes/450656731"
                        },
                        {
                            name: "Telnowedge",
                            siren: "495075079",
                            cnllUrl: "https://annuaire.cnll.fr/societes/495075079"
                        },
                        {
                            name: "APLOSE",
                            cdlUrl: "https://comptoir-du-libre.org/fr/users/165",
                            website: "https://www.aplose.fr"
                        },
                        {
                            name: "TEICEE",
                            cdlUrl: "https://comptoir-du-libre.org/fr/users/3838",
                            website: "https://www.teicee.com"
                        },
                        {
                            name: "CAP-REL",
                            cdlUrl: "https://comptoir-du-libre.org/fr/users/3216",
                            website: "https://cap-rel.fr"
                        },
                        {
                            name: "YPOK",
                            siren: "434940763",
                            cnllUrl: "https://annuaire.cnll.fr/societes/434940763"
                        },
                        {
                            name: "Entr'ouvert",
                            siren: "443170139",
                            cnllUrl: "https://annuaire.cnll.fr/societes/443170139"
                        },
                        {
                            name: "COMBODO",
                            siren: "522588979",
                            cnllUrl: "https://annuaire.cnll.fr/societes/522588979"
                        },
                        {
                            name: "AUKFOOD",
                            cdlUrl: "https://comptoir-du-libre.org/fr/users/3288",
                            website: "https://www.aukfood.fr"
                        },
                        {
                            name: "POLLEN ROBOTICS",
                            siren: "820266211",
                            cnllUrl: "https://annuaire.cnll.fr/societes/820266211"
                        },
                        {
                            name: "WORTEKS",
                            siren: "824429708",
                            cdlUrl: "https://comptoir-du-libre.org/fr/users/255",
                            cnllUrl: "https://annuaire.cnll.fr/societes/824429708",
                            website: "https://www.worteks.com/fr/"
                        }
                    ],
                    latestVersion: null
                }
            ]);
        },
        { timeout: 10_000 }
    );
});
