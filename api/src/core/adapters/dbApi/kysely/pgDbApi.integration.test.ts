import { Kysely } from "kysely";
import { beforeEach, describe, expect, it, afterEach } from "vitest";
import { expectPromiseToFailWith, expectToEqual } from "../../../../tools/test.helpers";
import { Agent, DbApiV2 } from "../../../ports/DbApiV2";
import { SoftwareExternalData } from "../../../ports/GetSoftwareExternalData";
import { SoftwareFormData } from "../../../usecases/readWriteSillData";
import { createKyselyPgDbApi } from "./createPgDbApi";
import { Database } from "./kysely.database";
import { createPgDialect } from "./kysely.dialect";

const agent = {
    id: 1,
    email: "test@test.com",
    organization: "test-orga"
};
const externalId = "external-id-111";
const softwareFormData: SoftwareFormData = {
    comptoirDuLibreId: 50,
    doRespectRgaa: true,
    externalId: "external-id-111",
    isFromFrenchPublicService: false,
    isPresentInSupportContract: true,
    similarSoftwareExternalDataIds: [externalId],
    softwareDescription: "Super software",
    softwareKeywords: ["bob", "l'éponge"],
    softwareLicense: "MIT",
    softwareLogoUrl: "https://example.com/logo.png",
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
    externalId,
    externalDataOrigin: "wikidata",
    developers: [{ name: "Bob", id: "bob" }],
    label: { en: "Some software" },
    description: { en: "Some software description" },
    isLibreSoftware: true,
    logoUrl: "https://example.com/logo.png",
    framaLibreId: "",
    websiteUrl: "https://example.com",
    sourceUrl: "https://example.com/source",
    documentationUrl: "https://example.com/documentation",
    license: "MIT"
};

const db = new Kysely<Database>({ dialect: createPgDialect("postgresql://sill:pg_password@localhost:5433/sill") });

describe("pgDbApi", () => {
    let dbApi: DbApiV2;

    beforeEach(async () => {
        dbApi = createKyselyPgDbApi(db);
        await db.deleteFrom("software_referents").execute();
        await db.deleteFrom("software_users").execute();
        await db.deleteFrom("softwares").execute();
        await db.deleteFrom("software_external_datas").execute();
        await db.deleteFrom("instances").execute();
        await db.deleteFrom("agents").execute();
    });

    afterEach(() => {
        console.log("------  END OF TEST ------");
    });

    describe("getCompiledDataPrivate", () => {
        it("gets private compiled data", async () => {
            const compiledDataPrivate = await dbApi.getCompiledDataPrivate();
            const { users, referents, instances, ...firstSoftware } = compiledDataPrivate[0];
            console.log(firstSoftware);
            //
            console.log(`Users n = ${users?.length} : `, users);
            console.log(`Referents n = ${referents?.length} : `, referents);
            console.log(`Instances n = ${instances?.length} : `, instances);
            expect(compiledDataPrivate).toHaveLength(100);
        });
    });

    describe("software", () => {
        it("creates a software, than gets it with getAll", async () => {
            console.log("------ software scenario ------");
            await db
                .insertInto("software_external_datas")
                .values({
                    ...softwareExternalData,
                    developers: JSON.stringify(softwareExternalData.developers),
                    label: JSON.stringify(softwareExternalData.label),
                    description: JSON.stringify(softwareExternalData.description),
                    isLibreSoftware: softwareExternalData.isLibreSoftware,
                    framaLibreId: softwareExternalData.framaLibreId,
                    websiteUrl: softwareExternalData.websiteUrl,
                    sourceUrl: softwareExternalData.sourceUrl,
                    documentationUrl: softwareExternalData.documentationUrl,
                    license: softwareExternalData.license
                })
                .execute();

            await dbApi.software.create({
                formData: softwareFormData,
                agentEmail: agent.email,
                externalDataOrigin: "wikidata"
            });

            const softwares = await dbApi.software.getAll();

            expectToEqual(softwares[0], {
                addedTime: expect.any(Number),
                updateTime: expect.any(Number),
                annuaireCnllServiceProviders: undefined,
                authors: softwareExternalData.developers.map(dev => ({
                    authorName: dev.name,
                    authorUrl: `https://www.wikidata.org/wiki/${dev.id}`
                })),
                categories: [],
                codeRepositoryUrl: softwareExternalData.sourceUrl,
                comptoirDuLibreId: 50,
                comptoirDuLibreServiceProviderCount: 0,
                dereferencing: undefined,
                documentationUrl: softwareExternalData.documentationUrl,
                externalDataOrigin: "wikidata",
                externalId,
                keywords: ["bob", "l'éponge"],
                latestVersion: undefined,
                license: "MIT",
                logoUrl: "https://example.com/logo.png",
                officialWebsiteUrl: softwareExternalData.websiteUrl,
                parentWikidataSoftware: undefined,
                prerogatives: {
                    doRespectRgaa: true,
                    isFromFrenchPublicServices: false,
                    isPresentInSupportContract: true
                },
                serviceProviders: [],
                similarSoftwares: [],
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
                testUrl: undefined,
                userAndReferentCountByOrganization: {},
                versionMin: ""
            });
        });
    });

    describe("instance", () => {
        it("creates an instance, than gets it with getAll", async () => {
            console.log("------ instance scenario ------");
            await db
                .insertInto("software_external_datas")
                .values({
                    ...softwareExternalData,
                    developers: JSON.stringify(softwareExternalData.developers),
                    label: JSON.stringify(softwareExternalData.label),
                    description: JSON.stringify(softwareExternalData.description),
                    isLibreSoftware: softwareExternalData.isLibreSoftware,
                    framaLibreId: softwareExternalData.framaLibreId,
                    websiteUrl: softwareExternalData.websiteUrl,
                    sourceUrl: softwareExternalData.sourceUrl,
                    documentationUrl: softwareExternalData.documentationUrl,
                    license: softwareExternalData.license
                })
                .execute();

            await dbApi.software.create({
                formData: softwareFormData,
                agentEmail: agent.email,
                externalDataOrigin: "wikidata"
            });
            const softwares = await dbApi.software.getAll();
            const softwareId = softwares[0].softwareId;
            console.log("saving instance");
            await dbApi.instance.create({
                agentEmail: agent.email,
                fromData: {
                    mainSoftwareSillId: softwareId,
                    organization: "test-orga",
                    targetAudience: "test-audience",
                    publicUrl: "https://example.com",
                    otherSoftwareWikidataIds: [externalId]
                }
            });

            console.log("getting instance");
            const instances = await dbApi.instance.getAll();

            expectToEqual(instances[0], {
                id: expect.any(Number),
                mainSoftwareSillId: softwareId,
                organization: "test-orga",
                targetAudience: "test-audience",
                publicUrl: "https://example.com",
                otherWikidataSoftwares: [
                    {
                        externalId,
                        label: softwareExternalData.label,
                        description: softwareExternalData.description
                    }
                ]
            });
        });
    });

    describe("agents", () => {
        it("adds an agent, get it by email, updates it, getAll", async () => {
            console.log("------ agent scenario------");
            const insertedAgent = {
                email: "test@test.com",
                organization: "test-organization",
                isPublic: true,
                about: "test about"
            };
            console.log("inserting agent");
            await dbApi.agent.add(insertedAgent);

            console.log("getting agent by email");
            const agent = await dbApi.agent.getByEmail(insertedAgent.email);
            expectToEqual(agent, { id: expect.any(Number), ...insertedAgent });

            const updatedAgent: Agent = {
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
            expectToEqual(allAgents, [updatedAgent]);

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
            await db
                .insertInto("software_external_datas")
                .values({
                    ...softwareExternalData,
                    developers: JSON.stringify(softwareExternalData.developers),
                    label: JSON.stringify(softwareExternalData.label),
                    description: JSON.stringify(softwareExternalData.description),
                    isLibreSoftware: softwareExternalData.isLibreSoftware,
                    framaLibreId: softwareExternalData.framaLibreId,
                    websiteUrl: softwareExternalData.websiteUrl,
                    sourceUrl: softwareExternalData.sourceUrl,
                    documentationUrl: softwareExternalData.documentationUrl,
                    license: softwareExternalData.license
                })
                .execute();

            await dbApi.software.create({
                formData: softwareFormData,
                agentEmail: agent.email,
                externalDataOrigin: "wikidata"
            });

            await dbApi.agent.add({
                email: "test@test.com",
                organization: "test-organization",
                isPublic: true,
                about: "test about"
            });

            softwareId = (await dbApi.software.getAll())[0].softwareId;
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
});
