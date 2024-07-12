import { Kysely } from "kysely";
import { beforeEach, describe, expect, it } from "vitest";
import { expectToEqual } from "../../../../tools/test.helpers";
import { SoftwareExternalData } from "../../../ports/GetSoftwareExternalData";
import { SoftwareFormData } from "../../../usecases/readWriteSillData";
import { createKyselyPgDbApi, PgDbApi } from "./createPgDbApi";
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
    let dbApi: PgDbApi;

    beforeEach(async () => {
        dbApi = createKyselyPgDbApi(db);
        await db.deleteFrom("softwares").execute();
        await db.deleteFrom("software_external_datas").execute();
        await db.deleteFrom("instances").execute();
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
                agent,
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
                agent,
                externalDataOrigin: "wikidata"
            });
            const softwares = await dbApi.software.getAll();
            const softwareId = softwares[0].softwareId;
            console.log("saving instance");
            await dbApi.instance.create({
                agent,
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
});
