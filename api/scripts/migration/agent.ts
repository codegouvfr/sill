import type { Db } from "../../src/core/ports/DbApi";
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
ts-node --skipProject ../sill-api/scripts/migration/agent.ts
*/

const zAgentRow = z.object({
    "email": z.string(),
    "organization": z.string(),
    "about": z.string().optional(),
    "isPublic": z.boolean()
});

{
    type Got = ReturnType<(typeof zAgentRow)["parse"]>;
    type Expected = OptionalIfCanBeUndefined<Db.AgentRow>;

    assert<Equals<Got, Expected>>();
}

const agentFilePath = pathJoin(process.cwd(), "agent.json");

fs.writeFileSync(
    agentFilePath,
    Buffer.from(
        JSON.stringify(
            JSON.parse(fs.readFileSync(agentFilePath).toString("utf8")).map((agentRow: Db.AgentRow) => {
                try {
                    zAgentRow.parse(agentRow);
                } catch (exception) {
                    console.log(agentRow);

                    throw exception;
                }

                const { email, organization, isPublic, about, ...rest } = agentRow;

                // eslint-disable-next-line @typescript-eslint/ban-types
                assert<Equals<typeof rest, {}>>();

                try {
                    assert(Object.keys(rest).length === 0);
                } catch (error) {
                    console.log(rest);

                    throw error;
                }

                return tsafeId<Db.AgentRow>({
                    email,
                    organization,
                    isPublic,
                    about
                });
            }),
            null,
            2
        ),
        "utf8"
    )
);
