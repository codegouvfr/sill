import { Kysely, sql } from "kysely";
import { beforeEach, describe, it, expect } from "vitest";
import { expectToEqual } from "../../../../tools/test.helpers";
import { CompiledData } from "../../../ports/CompileData";
import { SoftwareFormData } from "../../../usecases/readWriteSillData";
import { createKyselyPgDbApi, PgDbApi } from "./createPgDbApi";
import { Database } from "./kysely.database";
import { createPgDialect } from "./kysely.dialect";

const softwareFormData: SoftwareFormData = {
    comptoirDuLibreId: 50,
    doRespectRgaa: true,
    externalId: "external-id-111",
    isFromFrenchPublicService: false,
    isPresentInSupportContract: true,
    similarSoftwareExternalDataIds: ["external-id-222"],
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

const db = new Kysely<Database>({ dialect: createPgDialect("postgresql://sill:pg_password@localhost:5433/sill") });

describe("pgDbApi", () => {
    let dbApi: PgDbApi;

    beforeEach(async () => {
        dbApi = createKyselyPgDbApi(db);
        await db.deleteFrom("softwares").execute();
    });

    describe("getCompiledDataPrivate", () => {
        it("gets private compiled data", async () => {
            const compiledDataPrivate = await dbApi.getCompiledDataPrivate();
            const { users, referents, instances, ...firstSoftware } = compiledDataPrivate[0];
            // console.log(firstSoftware);
            //
            // console.log(`Users n = ${users?.length} : `, users);
            // console.log(`Referents n = ${referents?.length} : `, referents);
            // console.log(`Instances n = ${instances?.length} : `, instances);
            expect(compiledDataPrivate).toHaveLength(100);
        });
    });

    describe("software", () => {
        it("creates a software, than gets it with getAll", async () => {
            await dbApi.software.create({
                formData: softwareFormData,
                agent: {
                    id: 1,
                    email: "test@test.com",
                    organization: "test-orga"
                }
            });

            const softwares = await dbApi.software.getAll();

            expectToEqual(softwares[0], {
                addedTime: expect.any(Number),
                updateTime: expect.any(Number),
                annuaireCnllServiceProviders: undefined,
                authors: [],
                categories: [],
                codeRepositoryUrl: undefined,
                comptoirDuLibreId: 50,
                comptoirDuLibreServiceProviderCount: 0,
                dereferencing: undefined,
                documentationUrl: undefined,
                externalDataOrigin: undefined,
                externalId: "external-id-111",
                keywords: ["bob", "l'éponge"],
                latestVersion: undefined,
                license: "MIT",
                logoUrl: "https://example.com/logo.png",
                officialWebsiteUrl: undefined,
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
                softwareName: "",
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
});
