// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import { beforeEach, describe, expect, it } from "vitest";
import { SoftwareFormData } from "./readWriteSillData";
import { DbApiV2 } from "../ports/DbApiV2";
import { Kysely } from "kysely";
import { Database } from "../adapters/dbApi/kysely/kysely.database";
import { createPgDialect } from "../adapters/dbApi/kysely/kysely.dialect";
import {
    emptyExternalData,
    expectToEqual,
    expectToMatchObject,
    resetDB,
    testPgUrl,
    testSource
} from "../../tools/test.helpers";
import { createKyselyPgDbApi } from "../adapters/dbApi/kysely/createPgDbApi";
import { CreateSoftware, makeCreateSofware } from "./createSoftware";

const craSoftwareFormData = {
    softwareType: {
        type: "stack"
    },
    externalIdForSource: "Q118629387",
    sourceSlug: testSource.slug,
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

describe("Create software - Trying all the cases", () => {
    let dbApi: DbApiV2;
    let db: Kysely<Database>;
    let craSoftwareId: number;
    let agentId: number;
    let useCaseCreate: CreateSoftware;

    beforeEach(async () => {
        db = new Kysely<Database>({ dialect: createPgDialect(testPgUrl) });
        await resetDB(db);

        dbApi = createKyselyPgDbApi(db);

        agentId = await dbApi.agent.add({
            email: "myuser@example.com",
            organization: "myorg",
            about: "my about",
            isPublic: false
        });

        useCaseCreate = makeCreateSofware(dbApi);
    });

    it("should insert into three tables", async () => {
        craSoftwareId = await useCaseCreate({
            formData: craSoftwareFormData,
            agentId
        });

        const softwareList = await db.selectFrom("softwares").selectAll().execute();

        expectToEqual(softwareList.length, 1);
        expectToMatchObject(softwareList[0], {
            "addedByAgentId": agentId,
            "categories": [],
            "dereferencing": null,
            "description": "To create React apps.",
            "doRespectRgaa": true,
            "generalInfoMd": null,
            "isFromFrenchPublicService": true,
            "isPresentInSupportContract": true,
            "isStillInObservation": false,
            "keywords": ["Productivity", "Task", "Management"],
            "license": "MIT",
            "logoUrl": "https://example.com/logo.png",
            "name": "Create react app",
            "referencedSinceTime": expect.any(String), // To format
            "softwareType": {
                "type": "stack"
            },
            "versionMin": "1.0.0",
            "workshopUrls": []
        });

        const initialExternalSoftwarePackagesBeforeFetching = [
            emptyExternalData({
                externalId: "Q118629387",
                sourceSlug: "wikidata",
                softwareId: craSoftwareId
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

        const similarId = await dbApi.software.getSimilarSoftwareExternalDataPks({ softwareId: craSoftwareId });
        expectToMatchObject(similarId, [
            { sourceSlug: testSource.slug, externalId: "Q111590996", softwareId: undefined }
        ]);

        console.log(craSoftwareId);
    });

    it("Insert two software with the same name, should not duplicate the software", async () => {
        craSoftwareId = await useCaseCreate({
            formData: craSoftwareFormData,
            agentId
        });

        craSoftwareId = await useCaseCreate({
            formData: craSoftwareFormData,
            agentId
        });

        const softwareList = await db.selectFrom("softwares").selectAll().execute();
        expectToEqual(softwareList.length, 1);
    });

    it("Insert two software with the same name but different external Id, should create a new externalData linked with the saved software package", async () => {
        craSoftwareId = await useCaseCreate({
            formData: craSoftwareFormData,
            agentId
        });

        craSoftwareId = await useCaseCreate({
            formData: {
                ...craSoftwareFormData,
                externalIdForSource: "Q118629388"
            },
            agentId
        });

        const softwareList = await db.selectFrom("softwares").selectAll().execute();
        expectToEqual(softwareList.length, 1);

        const externdalDataList = await db.selectFrom("software_external_datas").selectAll().execute();
        expectToEqual(externdalDataList.length, 3);

        const externalIdForSoft = await dbApi.softwareExternalData.getBySoftwareId({ softwareId: craSoftwareId });
        expectToEqual(externalIdForSoft?.length, 2);
    });

    it("Insert a software when externalData is already saved with no related software, should not create another externalData and linked the existing one to the new software", async () => {
        await dbApi.softwareExternalData.saveIds([
            {
                sourceSlug: testSource.slug,
                externalId: "Q118629387"
            }
        ]);

        const externdalDataListBefore = await db.selectFrom("software_external_datas").selectAll().execute();
        expectToEqual(externdalDataListBefore.length, 1);

        craSoftwareId = await useCaseCreate({
            formData: craSoftwareFormData,
            agentId
        });

        const softwareList = await db.selectFrom("softwares").selectAll().execute();
        expectToEqual(softwareList.length, 1);

        const externdalDataList = await db.selectFrom("software_external_datas").selectAll().execute();
        expectToEqual(externdalDataList.length, 2);

        const externalDataUpdated = await dbApi.softwareExternalData.getBySoftwareId({ softwareId: craSoftwareId });
        expectToEqual(externalDataUpdated?.length, 1);
        expectToEqual(externalDataUpdated?.[0].externalId, "Q118629387");
    });

    it("Insert a software when externalData is already saved with related software, should not create another software neither new externalData", async () => {
        craSoftwareId = await useCaseCreate({
            formData: craSoftwareFormData,
            agentId
        });

        const externdalDataListBefore = await db.selectFrom("software_external_datas").selectAll().execute();
        expectToEqual(externdalDataListBefore.length, 2);

        const alteredNameForm = {
            ...craSoftwareFormData,
            softwareName: "Create react app 2"
        };

        craSoftwareId = await useCaseCreate({
            formData: alteredNameForm,
            agentId
        });

        const softwareList = await db.selectFrom("softwares").selectAll().execute();
        expectToEqual(softwareList.length, 1);

        const externdalDataList = await db.selectFrom("software_external_datas").selectAll().execute();
        expectToEqual(externdalDataList.length, 2);

        const externalDataUpdated = await dbApi.softwareExternalData.getBySoftwareId({ softwareId: craSoftwareId });
        expectToEqual(externalDataUpdated?.length, 1);
        expectToEqual(externalDataUpdated?.[0].externalId, "Q118629387");
    });

    it("Insert a software when similarExternalData is already saved, should linked the existing externalData to the new software row", async () => {
        await dbApi.softwareExternalData.saveIds([
            {
                sourceSlug: testSource.slug,
                externalId: "Q111590996"
            }
        ]);

        const externdalDataListBefore = await db.selectFrom("software_external_datas").selectAll().execute();
        expectToEqual(externdalDataListBefore.length, 1);

        craSoftwareId = await useCaseCreate({
            formData: craSoftwareFormData,
            agentId
        });

        const softwareList = await db.selectFrom("softwares").selectAll().execute();
        expectToEqual(softwareList.length, 1);

        const externdalDataList = await db.selectFrom("software_external_datas").selectAll().execute();
        expectToEqual(externdalDataList.length, 2);

        const externalDataUpdated = await dbApi.softwareExternalData.getBySoftwareId({ softwareId: craSoftwareId });
        expectToEqual(externalDataUpdated?.length, 1);
        expectToEqual(externalDataUpdated?.[0].externalId, "Q118629387");
    });

    it("Insert a software with multiples similarExternalData with one already existing, should create one and update the other one", async () => {
        await dbApi.softwareExternalData.saveIds([
            {
                sourceSlug: testSource.slug,
                externalId: "Q111590996"
            }
        ]);

        const externdalDataListBefore = await db.selectFrom("software_external_datas").selectAll().execute();
        expectToEqual(externdalDataListBefore.length, 1);

        craSoftwareId = await useCaseCreate({
            formData: { ...craSoftwareFormData, similarSoftwareExternalDataIds: ["Q111590996", "Q111590997"] },
            agentId
        });

        const softwareList = await db.selectFrom("softwares").selectAll().execute();
        expectToEqual(softwareList.length, 1);

        const externalDataList = await db.selectFrom("software_external_datas").selectAll().execute();
        expectToEqual(externalDataList.length, 3);

        const similarExternalData = await dbApi.software.getSimilarSoftwareExternalDataPks({
            softwareId: craSoftwareId
        });
        expectToEqual(similarExternalData?.length, 2);

        craSoftwareId = await useCaseCreate({
            formData: { ...craSoftwareFormData, similarSoftwareExternalDataIds: ["Q111590996", "Q111590998"] },
            agentId
        });

        const externalDataListUpdated = await db.selectFrom("software_external_datas").selectAll().execute();
        expectToEqual(externalDataListUpdated.length, 4);

        const similarExternalDataUpdated = await dbApi.software.getSimilarSoftwareExternalDataPks({
            softwareId: craSoftwareId
        });
        expectToEqual(similarExternalDataUpdated?.length, 2);
    });

    // TODO Another case : register
});
