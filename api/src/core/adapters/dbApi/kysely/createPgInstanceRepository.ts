import { Kysely } from "kysely";
import type { Equals } from "tsafe";
import { assert } from "tsafe/assert";
import { InstanceRepository } from "../../../ports/DbApiV2";
import { Instance } from "../../../usecases/readWriteSillData";
import { Database } from "./kysely.database";

export const createPgInstanceRepository = (db: Kysely<Database>): InstanceRepository => ({
    create: async ({ formData, agentId }) => {
        const { mainSoftwareSillId, organization, targetAudience, publicUrl, ...rest } = formData;
        assert<Equals<typeof rest, {}>>();

        const now = Date.now();
        const { instanceId } = await db
            .insertInto("instances")
            .values({
                addedByAgentId: agentId,
                updateTime: now,
                referencedSinceTime: now,
                mainSoftwareSillId,
                organization,
                targetAudience,
                instanceUrl: publicUrl,
                isPublic: !!publicUrl
            })
            .returning("id as instanceId")
            .executeTakeFirstOrThrow();
        return instanceId;
    },
    update: async ({ formData, instanceId }) => {
        const { mainSoftwareSillId, organization, targetAudience, publicUrl, ...rest } = formData;
        assert<Equals<typeof rest, {}>>();

        const now = Date.now();
        await db
            .updateTable("instances")
            .set({
                updateTime: now,
                mainSoftwareSillId,
                organization,
                targetAudience,
                instanceUrl: publicUrl,
                isPublic: !!publicUrl
            })
            .where("id", "=", instanceId)
            .execute();
    },
    countAddedByAgent: async ({ agentId }) => {
        const { count } = await db
            .selectFrom("instances")
            .select(qb => qb.fn.countAll<string>().as("count"))
            .where("addedByAgentId", "=", agentId)
            .executeTakeFirstOrThrow();
        return parseInt(count);
    },
    getAll: async () =>
        db
            .selectFrom("instances as i")
            .groupBy(["i.id"])
            .select([
                "i.id",
                "i.mainSoftwareSillId",
                "i.organization",
                "i.targetAudience",
                "i.instanceUrl",
                "i.isPublic"
            ])
            .execute()
            .then(instances =>
                instances.map(
                    (instance): Instance => ({
                        ...instance,
                        instanceUrl: instance.instanceUrl ?? undefined,
                        isPublic: instance.isPublic
                    })
                )
            )
});
