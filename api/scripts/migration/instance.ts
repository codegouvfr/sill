import type { Db } from "../../src/core/ports/DbApi";
import { z } from "zod";
import * as fs from "fs";
import { join as pathJoin } from "path";
import { assert } from "tsafe/assert";
import type { Equals } from "tsafe";
import { id as tsafeId } from "tsafe/id";
import type { OptionalIfCanBeUndefined } from "../../src/tools/OptionalIfCanBeUndefined";

const instanceFilePath = pathJoin(process.cwd(), "instance.json");

const zInstanceRow = z.object({
    "id": z.number(),
    "mainSoftwareSillId": z.number(),
    "organization": z.string(),
    "targetAudience": z.string(),
    "publicUrl": z.string().optional(),
    "otherSoftwareWikidataIds": z.array(z.string()),
    "addedByAgentEmail": z.string(),
    "referencedSinceTime": z.number(),
    "updateTime": z.number()
});

type Got = ReturnType<(typeof zInstanceRow)["parse"]>;
type Expected = OptionalIfCanBeUndefined<Db.InstanceRow>;

assert<Equals<Got, Expected>>();

fs.writeFileSync(
    instanceFilePath,
    Buffer.from(
        JSON.stringify(
            JSON.parse(fs.readFileSync(instanceFilePath).toString("utf8")).map((instanceRow: Db.InstanceRow) => {
                try {
                    zInstanceRow.parse(instanceRow);
                } catch (exception) {
                    console.log(instanceRow);

                    throw exception;
                }

                const {
                    id,
                    mainSoftwareSillId,
                    organization,
                    otherSoftwareWikidataIds,
                    publicUrl,
                    targetAudience,
                    addedByAgentEmail,
                    referencedSinceTime,
                    updateTime,
                    ...rest
                } = instanceRow;

                assert<Equals<typeof rest, {}>>();

                return tsafeId<Db.InstanceRow>({
                    id,
                    mainSoftwareSillId,
                    organization,
                    otherSoftwareWikidataIds,
                    publicUrl,
                    targetAudience,
                    addedByAgentEmail,
                    referencedSinceTime,
                    updateTime
                });
            }),
            null,
            2
        ),
        "utf8"
    )
);
