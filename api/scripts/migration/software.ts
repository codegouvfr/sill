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

const zSoftwareRow = z.object({
    "id": z.number(),
    "name": z.string(),
    "description": z.string(),
    "referencedSinceTime": z.number().optional(),
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
    "similarSoftwareIds": z.array(z.number()),
    "externalId": z.string().optional(),
    "externalDataOrigin": z.enum(["wikidata", "HAL"]).optional(),
    "comptoirDuLibreId": z.number().optional(),
    "license": z.string(),
    "softwareType": zSoftwareType,
    "versionMin": z.string().optional(),
    "workshopUrls": z.array(z.string()),
    "categories": z.array(z.string()),
    "generalInfoMd": z.string().optional(),
    "addedByAgentEmail": z.string(),
    "logoUrl": z.string().optional(),
    "keywords": z.array(z.string()),
    "isReferenced": z.boolean()
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
                    versionMin,
                    workshopUrls,
                    generalInfoMd,
                    updateTime,
                    doRespectRgaa,
                    similarSoftwareIds,
                    softwareType,
                    categories,
                    addedByAgentEmail,
                    logoUrl,
                    keywords,
                    isReferenced,
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
                    versionMin,
                    workshopUrls,
                    generalInfoMd,
                    updateTime,
                    doRespectRgaa,
                    similarSoftwareIds,
                    softwareType,
                    categories,
                    addedByAgentEmail,
                    logoUrl,
                    keywords,
                    isReferenced
                });
            }),
            null,
            2
        ),
        "utf8"
    )
);
