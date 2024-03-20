import type { Db } from "../../src/core/ports/DbApi";
import { z } from "zod";
import * as fs from "fs";
import { join as pathJoin } from "path";
import { assert } from "tsafe/assert";
import type { Equals } from "tsafe";
import { id } from "tsafe/id";
import { OptionalIfCanBeUndefined } from "../../src/tools/OptionalIfCanBeUndefined";

/*

This script is meant to help edit and make sure it is well formatted sill-data/software.json

cd ~/github/sill-api && npx tsc -w
cd ~/github/sill-data 
node ../sill-api/dist/bin/editSoftwareReferent.js

*/

const softwareReferentFilePath = pathJoin(process.cwd(), "softwareReferent.json");

const zSoftwareReferentRow = z.object({
    "softwareId": z.number(),
    "agentEmail": z.string(),
    "isExpert": z.boolean(),
    "useCaseDescription": z.string(),
    "serviceUrl": z.string().optional()
});

{
    type Got = ReturnType<(typeof zSoftwareReferentRow)["parse"]>;
    type Expected = OptionalIfCanBeUndefined<Db.SoftwareReferentRow>;

    assert<Equals<Got, Expected>>();
}

fs.writeFileSync(
    softwareReferentFilePath,
    Buffer.from(
        JSON.stringify(
            JSON.parse(fs.readFileSync(softwareReferentFilePath).toString("utf8")).map(
                (softwareReferentRow: Db.SoftwareReferentRow) => {
                    try {
                        zSoftwareReferentRow.parse(softwareReferentRow);
                    } catch (exception) {
                        console.log(softwareReferentRow);

                        throw exception;
                    }

                    const { softwareId, agentEmail, isExpert, useCaseDescription, serviceUrl, ...rest } =
                        softwareReferentRow;

                    try {
                        assert(Object.keys(rest).length === 0);
                    } catch (error) {
                        console.log(rest);

                        throw error;
                    }

                    return id<Db.SoftwareReferentRow>({
                        softwareId,
                        agentEmail,
                        isExpert,
                        useCaseDescription,
                        serviceUrl
                    });
                }
            ),
            null,
            2
        ),
        "utf8"
    )
);
