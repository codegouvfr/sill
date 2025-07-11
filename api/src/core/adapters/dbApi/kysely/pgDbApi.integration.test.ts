// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import { Kysely } from "kysely";
import { beforeEach, describe, expect, it, afterEach } from "vitest";
import { expectPromiseToFailWith, expectToEqual, resetDB, testPgUrl, testSource } from "../../../../tools/test.helpers";
import { DbAgent, DbApiV2 } from "../../../ports/DbApiV2";
import { SoftwareExternalData } from "../../../ports/GetSoftwareExternalData";
import { DeclarationFormData, SoftwareFormData } from "../../../usecases/readWriteSillData";
import { createKyselyPgDbApi } from "./createPgDbApi";
import { Database } from "./kysely.database";
import { createPgDialect } from "./kysely.dialect";
import { makeCreateSofware } from "../../../usecases/createSoftware";
import { identifersUtils } from "../../../../tools/identifiersTools";
import { makeGetPopulatedSoftware } from "../../../usecases/getPopulatedSoftware";
// import * as fs from "node:fs";
// import { compiledDataPrivateToPublic } from "../../../ports/CompileData";

const externalIdForSource = "external-id-111";

const similarExternalId = "external-id-222";
const softwareFormData: SoftwareFormData = {
    doRespectRgaa: true,
    externalIdForSource,
    sourceSlug: testSource.slug,
    isFromFrenchPublicService: false,
    isPresentInSupportContract: true,
    similarSoftwareExternalDataIds: [similarExternalId],
    softwareDescription: "Super software",
    softwareKeywords: ["bob", "l'éponge"],
    softwareLicense: "MIT",
    softwareLogoUrl: "https://soft-logo-url.com/logo.png",
    softwareMinimalVersion: "",
    softwareName: "",
    softwareType: {
        type: "desktop/mobile",
        os: {
            ios: true,
            android: true,
            mac: true,
            linux: false,
            windows: true
        }
    }
};

const softwareExternalData: SoftwareExternalData = {
    externalId: externalIdForSource,
    sourceSlug: testSource.slug,
    developers: [
        {
            "@type": "Person",
            name: "Bob",
            identifiers: [identifersUtils.makeWikidataIdentifier({ wikidataId: "QXXXXXX", additionalType: "Person" })],
            url: `https://www.wikidata.org/wiki/bob`
        }
    ],
    label: { en: "Some software" },
    description: { en: "Some software description" },
    isLibreSoftware: true,
    logoUrl: "https://external-software-logo-url.com/logo.png",
    websiteUrl: "https://example.com",
    sourceUrl: "https://example.com/source",
    documentationUrl: "https://example.com/documentation",
    license: "MIT",
    softwareVersion: "1.0.0",
    keywords: ["Usefull", "Daily"],
    programmingLanguages: ["C++"],
    applicationCategories: ["Software Cat I", "Software Cat II"],
    referencePublications: undefined,
    identifiers: undefined,
    publicationTime: new Date(1561566581000),
    providers: []
};

const similarSoftwareExternalData: SoftwareExternalData = {
    externalId: similarExternalId,
    sourceSlug: testSource.slug,
    developers: [
        {
            "@type": "Person",
            name: "Bobby",
            identifiers: [identifersUtils.makeWikidataIdentifier({ wikidataId: "QXXXXXX", additionalType: "Person" })],
            url: `https://www.wikidata.org/wiki/similar-bob`
        }
    ],
    label: "Some similar software",
    description: { en: "Some similar software description" },
    isLibreSoftware: true,
    logoUrl: "https://similar-software-logo-url.com/similar-logo.png",
    websiteUrl: "https://example.similar.com",
    sourceUrl: "https://example.similar.com/source",
    documentationUrl: "https://example.similar.com/documentation",
    license: "MIT",
    softwareVersion: "3.0.2",
    keywords: ["Infra", "Adminsys"],
    programmingLanguages: ["Python3"],
    applicationCategories: ["Software Cat I", "Software Cat II"],
    referencePublications: undefined,
    identifiers: undefined,
    publicationTime: new Date(1561566581000),
    providers: []
};

const insertedAgent = {
    email: "test@test.com",
    organization: "test-organization",
    isPublic: true,
    about: "test about"
};

const db = new Kysely<Database>({ dialect: createPgDialect(testPgUrl) });

describe("pgDbApi", () => {
    let dbApi: DbApiV2;

    beforeEach(async () => {
        dbApi = createKyselyPgDbApi(db);
        await resetDB(db);
    });

    afterEach(() => {
        console.log("------  END OF TEST ------");
    });

    describe("getCompiledDataPrivate", () => {
        it("gets private compiled data", async () => {
            // const compiledDataPrivate = await dbApi.getCompiledDataPrivate();
            // console.log("compiledDataPrivate.length : ", compiledDataPrivate.length);
            // // write softwares to file
            // const publicCompiledData = compiledDataPrivateToPublic(compiledDataPrivate);
            // publicCompiledData.sort((a, b) => (a.id >= b.id ? 1 : -1));
            // const data = JSON.stringify(publicCompiledData, null, 2);
            // fs.writeFileSync("./my-ordered-from-db.json", data);
            //
            // console.log("publicCompiledData", JSON.stringify(publicCompiledData, null, 2));
            //
            // expect(compiledDataPrivate.length > 0).toBe(true);
            // const { users, referents, instances, ...firstSoftware } = compiledDataPrivate.find(s => s.id === 42)!;
            // console.log(firstSoftware);
            // //
            // console.log(`Users n = ${users?.length} : `, users);
            // console.log(`Referents n = ${referents?.length} : `, referents);
            // console.log(`Instances n = ${instances?.length} : `, instances);
            // expect(compiledDataPrivate).toHaveLength(100);
        });
    });

    describe("software", () => {
        it("gets softwares with getAll, and with getAllSillSoftwareExternalIds", async () => {
            console.log("------ software scenario ------");
            const { softwareId, agentId } = await insertSoftwareExternalDataAndSoftwareAndAgent();

            await dbApi.softwareUser.add({
                agentId,
                softwareId,
                useCaseDescription: "des trucs de user",
                os: "windows",
                version: "1.0.0",
                serviceUrl: "https://example.com"
            });

            const getAllSoftware = makeGetPopulatedSoftware(dbApi);
            const softwares = await getAllSoftware();

            const actualSoftware = softwares[0];

            expectToEqual(actualSoftware, {
                addedTime: expect.any(Number),
                updateTime: expect.any(Number),
                applicationCategories: ["Software Cat I", "Software Cat II"],
                authors: softwareExternalData.developers.map(dev => ({
                    "@type": "Person" as const,
                    name: dev.name,
                    "affiliations": undefined,
                    "identifiers": [
                        {
                            "@type": "PropertyValue" as const,
                            "value": "QXXXXXX",
                            additionalType: "Person",
                            name: "ID on Wikidata",
                            subjectOf: {
                                "@type": "Website" as const,
                                "additionalType": "wikidata",
                                "name": "Wikidata",
                                "url": expect.any(String)
                            },
                            url: "https://www.wikidata.org/wiki/QXXXXXX"
                        }
                    ],
                    url: dev.url
                })),
                codeRepositoryUrl: softwareExternalData.sourceUrl,
                documentationUrl: softwareExternalData.documentationUrl,
                sourceSlug: testSource.slug,
                externalId: externalIdForSource,
                keywords: ["l'éponge", "bob"],
                latestVersion: {
                    "publicationTime": 1561566581000,
                    "semVer": "1.0.0"
                },
                license: "MIT",
                logoUrl: softwareFormData.softwareLogoUrl,
                officialWebsiteUrl: softwareExternalData.websiteUrl,
                prerogatives: {
                    doRespectRgaa: true,
                    isFromFrenchPublicServices: false,
                    isPresentInSupportContract: true
                },
                programmingLanguages: ["C++"],
                serviceProviders: [],
                similarSoftwares: [
                    {
                        sourceSlug: testSource.slug,
                        externalId: similarSoftwareExternalData.externalId,
                        label: similarSoftwareExternalData.label,
                        description: similarSoftwareExternalData.description,
                        isLibreSoftware: similarSoftwareExternalData.isLibreSoftware,
                        registered: false
                    }
                ],
                softwareDescription: "Super software",
                softwareId: expect.any(Number),
                softwareName: softwareFormData.softwareName,
                softwareType: {
                    os: {
                        android: true,
                        ios: true,
                        linux: false,
                        mac: true,
                        windows: true
                    },
                    type: "desktop/mobile"
                },
                userAndReferentCountByOrganization: {
                    [insertedAgent.organization]: {
                        userCount: 1,
                        referentCount: 0
                    }
                },
                versionMin: ""
            });

            console.log("getting all sill software external ids");
            const softwareExternalIds = await dbApi.software.getAllSillSoftwareExternalIds("wikidata");
            expectToEqual(softwareExternalIds, [similarExternalId, externalIdForSource]);
        });
    });

    describe("instance", () => {
        it("creates an instance, than gets it with getAll", async () => {
            console.log("------ instance scenario ------");
            const { agentId } = await insertSoftwareExternalDataAndSoftwareAndAgent();
            const getAllSoftware = makeGetPopulatedSoftware(dbApi);
            const softwares = await getAllSoftware();
            const softwareId = softwares[0].softwareId;
            console.log("saving instance");
            await dbApi.instance.create({
                agentId,
                formData: {
                    mainSoftwareSillId: softwareId,
                    organization: "test-orga",
                    targetAudience: "test-audience",
                    instanceUrl: "https://example.com",
                    isPublic: true
                }
            });

            console.log("getting instance");
            const instances = await dbApi.instance.getAll();

            expectToEqual(instances[0], {
                id: expect.any(Number),
                mainSoftwareSillId: softwareId,
                organization: "test-orga",
                targetAudience: "test-audience",
                instanceUrl: "https://example.com",
                isPublic: true
            });
        });
    });

    describe("agents", () => {
        it("adds an agent, get it by email, updates it, getAll", async () => {
            console.log("------ agent scenario------");
            console.log("inserting agent");
            const agentId = await dbApi.agent.add(insertedAgent);

            const makeSoftware = makeCreateSofware(dbApi);
            const softwareId = await makeSoftware({
                formData: softwareFormData,
                agentId
            });

            await db
                .insertInto("software_users")
                .values({
                    agentId,
                    softwareId,
                    os: "mac",
                    useCaseDescription: "des trucs de user",
                    version: "1",
                    serviceUrl: "https://example.com"
                })
                .execute();

            await db
                .insertInto("software_referents")
                .values({ agentId, softwareId, useCaseDescription: "des trucs de référent", isExpert: true })
                .execute();

            console.log("getting agent by email");
            const agent = await dbApi.agent.getByEmail(insertedAgent.email);
            const expectedDeclarations: (DeclarationFormData & { softwareName: string })[] = [
                {
                    declarationType: "user",
                    softwareName: softwareFormData.softwareName,
                    os: "mac",
                    version: "1",
                    serviceUrl: "https://example.com",
                    usecaseDescription: "des trucs de user"
                },
                {
                    declarationType: "referent",
                    softwareName: softwareFormData.softwareName,
                    isTechnicalExpert: true,
                    usecaseDescription: "des trucs de référent",
                    serviceUrl: undefined
                }
            ];

            expectToEqual(agent, {
                id: expect.any(Number),
                email: insertedAgent.email,
                organization: insertedAgent.organization,
                about: insertedAgent.about,
                isPublic: insertedAgent.isPublic,
                declarations: expectedDeclarations
            });

            const updatedAgent: DbAgent = {
                id: agent!.id,
                organization: "updated-test-organization",
                about: "updated about",
                email: "updated@test.com",
                isPublic: !insertedAgent.isPublic
            };

            console.log("updating agent");
            await dbApi.agent.update(updatedAgent);

            console.log("getting all agents");
            const allAgents = await dbApi.agent.getAll();
            expectToEqual(allAgents, [{ ...updatedAgent, declarations: expectedDeclarations }]);

            await db.deleteFrom("softwares").where("addedByAgentId", "=", updatedAgent.id).execute();

            console.log("removing agent");
            await dbApi.agent.remove(updatedAgent.id);

            console.log("getting all agents after delete");
            const allAgentsAfterDelete = await dbApi.agent.getAll();
            expectToEqual(allAgentsAfterDelete, []);
        });
    });

    describe("users and referents", () => {
        let softwareId: number;
        let agentId: number;
        beforeEach(async () => {
            console.log("before -- setting up test with software and agent");
            await insertSoftwareExternalDataAndSoftwareAndAgent();

            const getAllSoftware = makeGetPopulatedSoftware(dbApi);
            const softwares = await getAllSoftware();

            softwareId = softwares[0].softwareId;
            agentId = (await dbApi.agent.getAll())[0].id;
        });

        it("cannot add a user or referent if the software or agent is missing in db", async () => {
            console.log("------ wrong path for user or referent ------");
            await expectPromiseToFailWith(
                dbApi.softwareReferent.add({
                    agentId,
                    softwareId: 404,
                    isExpert: true,
                    serviceUrl: "https://example.com",
                    useCaseDescription: "my use case description"
                }),
                'insert or update on table "software_referents" violates foreign key constraint "software_referents_softwareId_fkey"'
            );

            await expectPromiseToFailWith(
                dbApi.softwareUser.add({
                    agentId: 404,
                    softwareId,
                    serviceUrl: "https://example.com",
                    useCaseDescription: "my use case description",
                    os: "windows",
                    version: "1.0.0"
                }),
                'insert or update on table "software_users" violates foreign key constraint "software_users_agentId_fkey"'
            );
        });

        it("adds the user or referent correctly, than removes them", async () => {
            console.log("------ user or referent scenario ------");
            const user = {
                agentId,
                softwareId,
                serviceUrl: "https://example.com",
                useCaseDescription: "my use case description",
                os: "windows" as const,
                version: "1.0.0"
            };
            await dbApi.softwareUser.add(user);

            const referent = {
                agentId,
                softwareId,
                serviceUrl: "https://example.com",
                useCaseDescription: "my use case description",
                isExpert: true
            };
            await dbApi.softwareReferent.add(referent);

            const totalReferentCount = await dbApi.softwareReferent.getTotalCount();
            expect(totalReferentCount).toBe(1);

            const referents = await db.selectFrom("software_referents").selectAll().execute();
            expectToEqual(referents, [referent]);

            const users = await db.selectFrom("software_users").selectAll().execute();
            expectToEqual(users, [user]);

            await dbApi.softwareUser.remove({ softwareId, agentId });
            const usersAfterDelete = await db.selectFrom("software_users").selectAll().execute();
            expectToEqual(usersAfterDelete, []);

            await dbApi.softwareReferent.remove({ softwareId, agentId });
            const referentsAfterDelete = await db.selectFrom("software_referents").selectAll().execute();
            expectToEqual(referentsAfterDelete, []);
        });
    });

    const insertSoftwareExternalDataAndSoftwareAndAgent = async () => {
        await db
            .insertInto("software_external_datas")
            .values(
                [softwareExternalData, similarSoftwareExternalData].map(softExtData => ({
                    ...softExtData,
                    sourceSlug: testSource.slug,
                    developers: JSON.stringify(softExtData.developers),
                    label: JSON.stringify(softExtData.label),
                    description: JSON.stringify(softExtData.description),
                    keywords: JSON.stringify(softExtData.keywords),
                    applicationCategories: JSON.stringify(softExtData.applicationCategories),
                    programmingLanguages: JSON.stringify(softExtData.programmingLanguages),
                    identifiers: JSON.stringify(softExtData.identifiers),
                    referencePublications: JSON.stringify(softExtData.referencePublications),
                    providers: JSON.stringify(softExtData.providers)
                }))
            )
            .execute();

        const agentId = await dbApi.agent.add(insertedAgent);

        const makeSoftware = makeCreateSofware(dbApi);
        const softwareId = await makeSoftware({
            formData: softwareFormData,
            agentId
        });

        return {
            softwareId,
            agentId
        };
    };
});
