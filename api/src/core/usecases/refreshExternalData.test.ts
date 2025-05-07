// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import { Kysely, sql } from "kysely";
import { describe, it, beforeEach, expect } from "vitest";
import { expectToEqual, expectToMatchObject, testPgUrl } from "../../tools/test.helpers";
import type { DbApiV2 } from "../ports/DbApiV2";
import { ExternalDataOrigin } from "../ports/GetSoftwareExternalData";
import type { SoftwareFormData, Source } from "./readWriteSillData";
import { createKyselyPgDbApi } from "../adapters/dbApi/kysely/createPgDbApi";
import type { Database } from "../adapters/dbApi/kysely/kysely.database";
import { createPgDialect } from "../adapters/dbApi/kysely/kysely.dialect";
import { makeCreateSofware } from "./createSoftware";
import { makeRefreshExternalDataForSoftware } from "./refreshExternalData";

const craSoftwareFormData = {
    softwareType: {
        type: "stack"
    },
    externalIdForSource: "Q118629387",
    sourceSlug: "wikidata",
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
    await db
        .insertInto("softwares")
        .values({
            id: apacheSoftwareId,
            softwareType: JSON.stringify({
                type: "desktop/mobile",
                os: { ios: false, mac: false, linux: true, android: false, windows: false }
            }),
            externalIdForSource: "Q11354",
            sourceSlug: "wikidata",
            comptoirDuLibreId: 3737,
            name: "Apache HTTP Server",
            description: "Serveur Web & Reverse Proxy",
            license: "Apache-2.0",
            versionMin: "212",
            isPresentInSupportContract: true,
            isFromFrenchPublicService: false,
            logoUrl: "https://sill.code.gouv.fr/logo/apache-http.png",
            keywords: JSON.stringify(["serveur", "http", "web", "server", "apache"]),
            doRespectRgaa: false,
            isStillInObservation: false,
            workshopUrls: JSON.stringify([]),
            categories: JSON.stringify([]),
            generalInfoMd: null,
            addedByAgentId: agentId,
            dereferencing: null,
            referencedSinceTime: 1728462232094,
            updateTime: 1728462232094
        })
        .execute();

    await db
        .insertInto("software_external_datas")
        .values({
            externalId: "Q11354",
            sourceSlug: "wikidata",
            softwareId: apacheSoftwareId,
            developers: JSON.stringify([]),
            label: JSON.stringify({}),
            description: JSON.stringify({})
        })
        .execute();
};

const acceleroId = 2;
const insertAcceleroWithCorrectId = async (db: Kysely<Database>, agentId: number) => {
    await db
        .insertInto("softwares")
        .values({
            id: acceleroId,
            softwareType: JSON.stringify({ type: "stack" }),
            externalIdForSource: "Q2822666",
            sourceSlug: "wikidata",
            comptoirDuLibreId: 304,
            name: "Acceleo",
            description: "Outil et/ou plugin de génération de tout ou partie du code",
            license: "EPL-2.0",
            versionMin: "3.7.8",
            isPresentInSupportContract: false,
            isFromFrenchPublicService: false,
            logoUrl: null,
            keywords: JSON.stringify(["modélisation", "génération", "code", "modeling", "code generation"]),
            doRespectRgaa: false,
            isStillInObservation: false,
            workshopUrls: JSON.stringify([]),
            categories: JSON.stringify(["Other Development Tools"]),
            generalInfoMd: null,
            addedByAgentId: agentId,
            dereferencing: null,
            referencedSinceTime: 1514764800000,
            updateTime: 1514764800000
        })
        .execute();

    await db
        .insertInto("software_external_datas")
        .values({
            externalId: "Q2822666",
            sourceSlug: "wikidata",
            softwareId: acceleroId,
            developers: JSON.stringify([]),
            label: JSON.stringify({}),
            description: JSON.stringify({})
        })
        .execute();

    return acceleroId;
};

const emptyExternalData = (params: { softwareId?: number; externalId: string; sourceSlug: string }) => {
    const { softwareId = null, externalId, sourceSlug } = params;
    return {
        externalId,
        developers: [],
        label: {},
        description: {},
        isLibreSoftware: null,
        logoUrl: null,
        websiteUrl: null,
        sourceUrl: null,
        documentationUrl: null,
        license: null,
        softwareVersion: null,
        publicationTime: null,
        keywords: null,
        programmingLanguages: null,
        applicationCategories: null,
        referencePublications: null,
        identifiers: null,
        sourceSlug,
        softwareId,
        lastDataFetchAt: null
    };
};

const emptyExternalDataCleaned = (params: { softwareId?: number; externalId: string; sourceSlug: string }) => {
    const { softwareId = undefined, externalId, sourceSlug } = params;
    return {
        externalId,
        developers: [],
        label: {},
        description: {},
        isLibreSoftware: undefined,
        logoUrl: undefined,
        websiteUrl: undefined,
        sourceUrl: undefined,
        documentationUrl: undefined,
        license: undefined,
        softwareVersion: undefined,
        publicationTime: undefined,
        keywords: undefined,
        programmingLanguages: undefined,
        applicationCategories: undefined,
        referencePublications: undefined,
        identifiers: undefined,
        sourceSlug,
        softwareId,
        lastDataFetchAt: undefined
    };
};

const source = {
    slug: "wikidata",
    priority: 1,
    url: "https://www.wikidata.org",
    description: undefined,
    kind: "wikidata"
} satisfies Source;

describe("fetches software extra data (from different providers)", () => {
    let fetchAndSaveSoftwareExtraDataBySoftwareId: Awaited<ReturnType<typeof makeRefreshExternalDataForSoftware>>;
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
        await db.deleteFrom("sources").execute();

        await db
            .insertInto("sources")
            .values({
                ...source,
                kind: source.kind as ExternalDataOrigin
            })
            .execute();

        await sql`SELECT setval('softwares_id_seq', 11, false)`.execute(db);

        dbApi = createKyselyPgDbApi(db);

        const agentId = await dbApi.agent.add({
            email: "myuser@example.com",
            organization: "myorg",
            about: "my about",
            isPublic: false
        });

        const makeSoftware = makeCreateSofware(dbApi);
        craSoftwareId = await makeSoftware({
            formData: craSoftwareFormData,
            agentId
        });

        await insertApacheWithCorrectId(db, agentId);
        await insertAcceleroWithCorrectId(db, agentId);

        fetchAndSaveSoftwareExtraDataBySoftwareId = makeRefreshExternalDataForSoftware({
            dbApi
        });
    });

    it("does nothing if the software is not found", async () => {
        const initialExternalSoftwarePackagesBeforeFetching = [
            emptyExternalData({
                "externalId": "Q2822666",
                "softwareId": 2,
                "sourceSlug": "wikidata"
            }),
            emptyExternalData({
                "externalId": "Q11354",
                "softwareId": 6,
                "sourceSlug": "wikidata"
            }),
            emptyExternalData({
                externalId: "Q118629387",
                sourceSlug: "wikidata",
                softwareId: 11
            }),
            emptyExternalData({
                externalId: "Q111590996",
                sourceSlug: "wikidata"
            })
        ];

        const softwareExternalDatas = await db
            .selectFrom("software_external_datas")
            .selectAll()
            .orderBy("softwareId", "asc")
            .execute();

        expectToMatchObject(softwareExternalDatas, initialExternalSoftwarePackagesBeforeFetching);

        await fetchAndSaveSoftwareExtraDataBySoftwareId({ softwareId: 404 });

        const updatedSoftwareExternalDatas = await db
            .selectFrom("software_external_datas")
            .selectAll()
            .orderBy("softwareId", "asc")
            .execute();

        expectToEqual(updatedSoftwareExternalDatas, initialExternalSoftwarePackagesBeforeFetching);
    });

    it(
        "gets software external data and saves it, and does not save other extra data if there is nothing relevant",
        async () => {
            const softwareExternalDatas = await db.selectFrom("software_external_datas").selectAll().execute();
            expect(softwareExternalDatas).toHaveLength(4);

            const source = await db
                .selectFrom("sources")
                .selectAll()
                .orderBy("priority", "desc")
                .executeTakeFirstOrThrow();
            if (!source) throw new Error("Source not found");

            expect(softwareExternalDatas[0].lastDataFetchAt).toBe(null);

            await fetchAndSaveSoftwareExtraDataBySoftwareId({ softwareId: craSoftwareId });

            const updatedSoftwareExternalDatas = await dbApi.softwareExternalData.getAll();

            expectToEqual(updatedSoftwareExternalDatas, [
                emptyExternalDataCleaned({
                    "externalId": "Q11354",
                    "softwareId": 6,
                    "sourceSlug": "wikidata"
                }),
                emptyExternalDataCleaned({
                    "externalId": "Q2822666",
                    "softwareId": 2,
                    "sourceSlug": "wikidata"
                }),
                {
                    applicationCategories: undefined,
                    description: "deprecated tool for creating React SPA using webpack as bundler",
                    developers: [],
                    documentationUrl: undefined,
                    softwareId: craSoftwareId,
                    sourceSlug: source.slug,
                    externalId: craSoftwareFormData.externalIdForSource,
                    isLibreSoftware: true,
                    keywords: [],
                    label: "create-react-app",
                    license: "MIT licence",
                    logoUrl: undefined,
                    sourceUrl: "https://github.com/facebook/create-react-app",
                    websiteUrl: "https://create-react-app.dev/",
                    programmingLanguages: [],
                    referencePublications: undefined,
                    identifiers: [],
                    softwareVersion: "5.0.1",
                    publicationTime: new Date("2022-04-12T00:00:00.000Z"),
                    lastDataFetchAt: expect.any(Number)
                },
                {
                    applicationCategories: undefined,
                    description: "open-source JavaScript module bundler",
                    developers: [
                        {
                            "@type": "Person",
                            identifier: "Q58482636",
                            name: "Evan You",
                            url: `https://www.wikidata.org/wiki/Q58482636`
                        }
                    ],
                    documentationUrl: "https://vitejs.dev/guide/",
                    sourceSlug: source.slug,
                    softwareId: undefined,
                    externalId: "Q111590996",
                    isLibreSoftware: true,
                    keywords: [],
                    label: "Vite",
                    license: "MIT licence",
                    logoUrl:
                        "//upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Vitejs-logo.svg/250px-Vitejs-logo.svg.png",
                    sourceUrl: "https://github.com/vitejs/vite",
                    websiteUrl: "https://vitejs.dev/",
                    programmingLanguages: ["JavaScript"],
                    referencePublications: undefined,
                    identifiers: [],
                    softwareVersion: expect.any(String),
                    publicationTime: expect.any(Date),
                    lastDataFetchAt: expect.any(Number)
                }
            ]);

            const otherExtraData = await db.selectFrom("compiled_softwares").selectAll().execute();
            expectToEqual(otherExtraData, [
                {
                    "annuaireCnllServiceProviders": null,
                    "comptoirDuLibreSoftware": null,
                    "latestVersion": null,
                    "serviceProviders": [],
                    "softwareId": 11
                }
            ]);

            const { lastDataFetchAt } = await db
                .selectFrom("software_external_datas")
                .select("lastDataFetchAt")
                .where("softwareId", "=", craSoftwareId)
                .executeTakeFirstOrThrow();
            expect(lastDataFetchAt).toBeTruthy();
        },
        { timeout: 20_000 }
    );

    it(
        "gets software external data and saves it, and save other extra data",
        async () => {
            const source = await db
                .selectFrom("sources")
                .selectAll()
                .orderBy("priority", "desc")
                .executeTakeFirstOrThrow();
            if (!source) throw new Error("Source not found");

            const softwareExternalDatas = await dbApi.softwareExternalData.getAll();
            expect(softwareExternalDatas).toHaveLength(4);

            await fetchAndSaveSoftwareExtraDataBySoftwareId({ softwareId: apacheSoftwareId });

            const updatedSoftwareExternalDatas = await dbApi.softwareExternalData.getAll();
            expectToEqual(updatedSoftwareExternalDatas, [
                emptyExternalDataCleaned({
                    externalId: "Q118629387",
                    sourceSlug: "wikidata",
                    softwareId: 11
                }),
                emptyExternalDataCleaned({
                    externalId: "Q111590996",
                    sourceSlug: "wikidata"
                }),
                emptyExternalDataCleaned({
                    "externalId": "Q2822666",
                    "softwareId": 2,
                    "sourceSlug": "wikidata"
                }),
                {
                    applicationCategories: undefined,
                    description: {
                        en: "open-source web server software",
                        fr: "serveur web sous licence libre"
                    },
                    developers: [
                        {
                            "@type": "Organization",
                            identifier: "Q489709",
                            name: "Apache Software Foundation",
                            url: "https://www.wikidata.org/wiki/Q489709"
                        }
                    ],
                    documentationUrl: undefined,
                    sourceSlug: source.slug,
                    softwareId: apacheSoftwareId,
                    externalId: "Q11354",
                    isLibreSoftware: false,
                    keywords: [],
                    label: "Apache HTTP Server",
                    license: "Apache License v2.0",
                    logoUrl:
                        "//upload.wikimedia.org/wikipedia/commons/thumb/1/10/Apache_HTTP_server_logo_%282019-present%29.svg/250px-Apache_HTTP_server_logo_%282019-present%29.svg.png",
                    sourceUrl: "https://github.com/apache/httpd",
                    websiteUrl: "https://httpd.apache.org/",
                    referencePublications: undefined,
                    identifiers: [],
                    programmingLanguages: ["C"],
                    softwareVersion: "2.5.0-alpha",
                    publicationTime: new Date("2017-11-08T00:00:00.000Z"),
                    lastDataFetchAt: expect.any(Number)
                }
            ]);
        },
        { timeout: 20_000 }
    );
});
