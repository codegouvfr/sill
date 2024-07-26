import { beforeAll, describe, expect, it } from "vitest";
import { InMemoryDbApi } from "../core/adapters/dbApi/InMemoryDbApi";
import { CompiledData } from "../core/ports/CompileData";
import {
    createDeclarationFormData,
    createInstanceFormData,
    createSoftwareFormData,
    expectToEqual,
    expectToMatchObject
} from "../tools/test.helpers";
import { ApiCaller, createTestCaller, defaultUser } from "./createTestCaller";

const expectedSoftwareId = 1;

const softwareFormData = createSoftwareFormData();
const declarationFormData = createDeclarationFormData();
const instanceFormData = createInstanceFormData({ mainSoftwareSillId: expectedSoftwareId });

describe("RPC e2e tests", () => {
    let apiCaller: ApiCaller;
    let inMemoryDb: InMemoryDbApi;

    describe("getAgents - wrong paths", () => {
        it("fails with UNAUTHORIZED if user is not logged in", async () => {
            ({ apiCaller, inMemoryDb } = await createTestCaller({ user: undefined }));
            expect(apiCaller.getAgents()).rejects.toThrow("UNAUTHORIZED");
        });
    });

    describe("createUserOrReferent - Wrong paths", () => {
        it("fails with UNAUTHORIZED if user is not logged in", async () => {
            ({ apiCaller, inMemoryDb } = await createTestCaller({ user: undefined }));
            expect(
                apiCaller.createUserOrReferent({
                    formData: declarationFormData,
                    softwareName: "Some software"
                })
            ).rejects.toThrow("UNAUTHORIZED");
        });

        it("fails when software is not found in SILL", async () => {
            ({ apiCaller, inMemoryDb } = await createTestCaller());
            expect(
                apiCaller.createUserOrReferent({
                    formData: declarationFormData,
                    softwareName: "Some software"
                })
            ).rejects.toThrow("Software not in SILL");
        });
    });

    describe("createSoftware - Wrong paths", () => {
        it("fails with UNAUTHORIZED if user is not logged in", async () => {
            ({ apiCaller, inMemoryDb } = await createTestCaller({ user: undefined }));
            expect(
                apiCaller.createSoftware({
                    formData: softwareFormData
                })
            ).rejects.toThrow("UNAUTHORIZED");
        });
    });

    // ⚠️ reminder : you need to run the whole scenarios
    // because those tests are not isolated
    // (the order is important)⚠️
    describe("Scenario - Add a new software then mark an agent as user of this software", () => {
        beforeAll(async () => {
            ({ apiCaller, inMemoryDb } = await createTestCaller());
        });

        it("gets the list of agents, which is initially empty", async () => {
            const { agents } = await apiCaller.getAgents();
            expect(agents).toHaveLength(0);
        });

        it("adds a new software", async () => {
            expect(inMemoryDb.softwareRows).toHaveLength(0);
            const initialSoftwares = await apiCaller.getSoftwares();
            expectToEqual(initialSoftwares, []);

            await apiCaller.createSoftware({
                formData: softwareFormData
            });
            expect(inMemoryDb.softwareRows).toHaveLength(1);
            const expectedSoftware: Partial<CompiledData.Software<"public">> = {
                "description": softwareFormData.softwareDescription,
                "externalId": softwareFormData.externalId,
                "doRespectRgaa": softwareFormData.doRespectRgaa,
                "isFromFrenchPublicService": softwareFormData.isFromFrenchPublicService,
                "isPresentInSupportContract": softwareFormData.isPresentInSupportContract,
                "keywords": softwareFormData.softwareKeywords,
                "license": softwareFormData.softwareLicense,
                "logoUrl": softwareFormData.softwareLogoUrl,
                "name": softwareFormData.softwareName,
                "softwareType": softwareFormData.softwareType,
                "versionMin": softwareFormData.softwareMinimalVersion,
                "testUrls": [],
                "workshopUrls": [],
                "categories": [],
                "isStillInObservation": false,
                "id": expectedSoftwareId
            };

            expectToMatchObject(inMemoryDb.softwareRows[0], {
                ...expectedSoftware,
                "addedByAgentEmail": defaultUser.email,
                "similarSoftwareExternalDataIds": softwareFormData.similarSoftwareExternalDataIds
            });
        });

        it("gets the list of agents, which now has the user which added the software", async () => {
            const { agents } = await apiCaller.getAgents();
            expect(agents).toHaveLength(1);
            expectToMatchObject(agents[0], {
                "email": defaultUser.email,
                "organization": defaultUser.organization
            });
        });

        it("gets the new software in the list", async () => {
            const softwares = await apiCaller.getSoftwares();
            expect(softwares).toHaveLength(1);
            expectToMatchObject(softwares[0], { softwareName: softwareFormData.softwareName });
        });

        it("adds an agent as user of the software", async () => {
            expect(inMemoryDb.agentRows).toHaveLength(1);
            expect(inMemoryDb.softwareRows).toHaveLength(1);
            expect(inMemoryDb.softwareUserRows).toHaveLength(0);
            await apiCaller.createUserOrReferent({
                formData: declarationFormData,
                softwareName: "Some software"
            });

            if (declarationFormData.declarationType !== "user")
                throw new Error("This test is only for user declaration");

            expect(inMemoryDb.softwareUserRows).toHaveLength(1);

            expectToEqual(inMemoryDb.softwareUserRows[0], {
                "agentEmail": defaultUser.email,
                "softwareId": inMemoryDb.softwareRows[0].id,
                "os": declarationFormData.os,
                "serviceUrl": declarationFormData.serviceUrl,
                "useCaseDescription": declarationFormData.usecaseDescription,
                "version": declarationFormData.version
            });
        });

        it("adds an instance of the software", async () => {
            expect(inMemoryDb.softwareRows).toHaveLength(1);
            expect(inMemoryDb.instanceRows).toHaveLength(0);
            await apiCaller.createInstance({
                formData: instanceFormData
            });
            expect(inMemoryDb.instanceRows).toHaveLength(1);
            expectToMatchObject(inMemoryDb.instanceRows[0], {
                "id": 1,
                "addedByAgentEmail": defaultUser.email,
                "mainSoftwareSillId": expectedSoftwareId,
                "organization": instanceFormData.organization,
                "publicUrl": instanceFormData.publicUrl,
                "targetAudience": instanceFormData.targetAudience
            });
        });

        it("gets the new instances in the list", async () => {
            const instances = await apiCaller.getInstances();
            expect(instances).toHaveLength(1);
            expectToMatchObject(instances[0], {
                "id": 1,
                "mainSoftwareSillId": expectedSoftwareId,
                "organization": instanceFormData.organization,
                "publicUrl": instanceFormData.publicUrl,
                "targetAudience": instanceFormData.targetAudience
            });
        });
    });
});
