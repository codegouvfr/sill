import type { Db, Os, SoftwareType } from "../../src/core/ports/DbApi";
import * as fs from "fs";
import { join as pathJoin } from "path";
import { assert } from "tsafe/assert";
import type { Equals } from "tsafe";
import { z } from "zod";
import { id as tsafeId } from "tsafe/id";
import type { OptionalIfCanBeUndefined } from "../../src/tools/OptionalIfCanBeUndefined";

/*
npm -g install ts-node
cd ~/github/sill/sill-data
ts-node --skipProject ../sill-api/src/scripts/migration/software.ts
*/

const zOs = z.enum(["windows", "linux", "mac", "android", "ios"]);

{
    type Got = ReturnType<(typeof zOs)["parse"]>;
    type Expected = Os;

    assert<Equals<Got, Expected>>();
}

const zSoftwareType = z.union([
    z.object({
        "type": z.literal("desktop/mobile"),
        "os": z.object({
            "windows": z.boolean(),
            "linux": z.boolean(),
            "mac": z.boolean(),
            "android": z.boolean(),
            "ios": z.boolean()
        })
    }),
    z.object({
        "type": z.literal("cloud")
    }),
    z.object({
        "type": z.literal("stack")
    })
]);

{
    type Got = ReturnType<(typeof zSoftwareType)["parse"]>;
    type Expected = SoftwareType;

    assert<Equals<Got, Expected>>();
}

// Previous version, kept until the new one reach production :

// const zSoftwareRow = z.object({
//     "id": z.number(),
//     "name": z.string(),
//     "description": z.string(),
//     "referencedSinceTime": z.number(),
//     "updateTime": z.number(),
//     "dereferencing": z
//       .object({
//           "reason": z.string().optional(),
//           "time": z.number(),
//           "lastRecommendedVersion": z.string().optional()
//       })
//       .optional(),
//     "isStillInObservation": z.boolean(),
//     "parentSoftwareWikidataId": z.string().optional(),
//     "doRespectRgaa": z.boolean().or(z.null()),
//     "isFromFrenchPublicService": z.boolean(),
//     "isPresentInSupportContract": z.boolean(),
//     "similarSoftwareWikidataIds": z.array(z.string()),
//     "wikidataId": z.string().optional(),
//     "comptoirDuLibreId": z.number().optional(),
//     "license": z.string(),
//     "softwareType": zSoftwareType,
//     "catalogNumeriqueGouvFrId": z.string().optional(),
//     "versionMin": z.string(),
//     "workshopUrls": z.array(z.string()),
//     "testUrls": z.array(
//       z.object({
//           "description": z.string(),
//           "url": z.string()
//       })
//     ),
//     "categories": z.array(z.string()),
//     "generalInfoMd": z.string().optional(),
//     "addedByAgentEmail": z.string(),
//     "logoUrl": z.string().optional(),
//     "keywords": z.array(z.string())
// });

const zSoftwareRow = z.object({
    "id": z.number(),
    "name": z.string(),
    "description": z.string(),
    "referencedSinceTime": z.number(),
    "updateTime": z.number(),
    "dereferencing": z
        .object({
            "reason": z.string().optional(),
            "time": z.number(),
            "lastRecommendedVersion": z.string().optional()
        })
        .optional(),
    "isStillInObservation": z.boolean(),
    "parentSoftwareWikidataId": z.string().optional(),
    "doRespectRgaa": z.boolean().or(z.null()),
    "isFromFrenchPublicService": z.boolean(),
    "isPresentInSupportContract": z.boolean(),
    "similarSoftwareExternalDataIds": z.array(z.string()),
    "externalId": z.string().optional(),
    "externalDataOrigin": z.enum(["wikidata", "HAL"]).optional(),
    "comptoirDuLibreId": z.number().optional(),
    "license": z.string(),
    "softwareType": zSoftwareType,
    "catalogNumeriqueGouvFrId": z.string().optional(),
    "versionMin": z.string(),
    "workshopUrls": z.array(z.string()),
    "testUrls": z.array(
        z.object({
            "description": z.string(),
            "url": z.string()
        })
    ),
    "categories": z.array(z.string()),
    "generalInfoMd": z.string().optional(),
    "addedByAgentEmail": z.string(),
    "logoUrl": z.string().optional(),
    "keywords": z.array(z.string())
});

{
    type Got = ReturnType<(typeof zSoftwareRow)["parse"]>;
    type Expected = OptionalIfCanBeUndefined<Db.SoftwareRow>;

    assert<Equals<Got, Expected>>();
}

const softwareFilePath = pathJoin(process.cwd(), "software.json");

fs.writeFileSync(
    softwareFilePath,
    Buffer.from(
        JSON.stringify(
            JSON.parse(fs.readFileSync(softwareFilePath).toString("utf8")).map((softwareRow: Db.SoftwareRow) => {
                try {
                    zSoftwareRow.parse(softwareRow);
                } catch (exception) {
                    console.log(softwareRow);

                    throw exception;
                }

                const {
                    id,
                    name,
                    description,
                    referencedSinceTime,
                    dereferencing,
                    isStillInObservation,
                    parentSoftwareWikidataId,
                    isFromFrenchPublicService,
                    isPresentInSupportContract,
                    externalId,
                    externalDataOrigin,
                    comptoirDuLibreId,
                    license,
                    catalogNumeriqueGouvFrId,
                    versionMin,
                    workshopUrls,
                    testUrls,
                    generalInfoMd,
                    updateTime,
                    doRespectRgaa,
                    similarSoftwareExternalDataIds,
                    softwareType,
                    categories,
                    addedByAgentEmail,
                    logoUrl,
                    keywords,
                    ...rest
                } = softwareRow;

                // eslint-disable-next-line @typescript-eslint/ban-types
                assert<Equals<typeof rest, {}>>();

                try {
                    assert(Object.keys(rest).length === 0);
                } catch (error) {
                    console.log(rest);

                    throw error;
                }

                return tsafeId<Db.SoftwareRow>({
                    id,
                    name,
                    description,
                    referencedSinceTime,
                    dereferencing,
                    isStillInObservation,
                    parentSoftwareWikidataId,
                    isFromFrenchPublicService,
                    isPresentInSupportContract,
                    externalId,
                    externalDataOrigin,
                    comptoirDuLibreId,
                    license,
                    catalogNumeriqueGouvFrId,
                    versionMin,
                    workshopUrls,
                    testUrls,
                    generalInfoMd,
                    updateTime,
                    doRespectRgaa,
                    similarSoftwareExternalDataIds,
                    softwareType,
                    categories,
                    addedByAgentEmail,
                    logoUrl,
                    keywords
                });
            }),
            null,
            2
        ),
        "utf8"
    )
);
