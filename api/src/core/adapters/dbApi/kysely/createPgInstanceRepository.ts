import { Kysely } from "kysely";
import type { Equals } from "tsafe";
import { assert } from "tsafe/assert";
import { InstanceRepository } from "../../../ports/DbApiV2";
import { Instance } from "../../../usecases/readWriteSillData";
import { Database } from "./kysely.database";

export const createPgInstanceRepository = (db: Kysely<Database>): InstanceRepository => ({
    create: async ({ fromData, agentEmail }) => {
        const { mainSoftwareSillId, organization, targetAudience, publicUrl, ...rest } = fromData;
        assert<Equals<typeof rest, {}>>();

        const now = Date.now();
        await db
            .insertInto("instances")
            .values({
                addedByAgentEmail: agentEmail,
                updateTime: now,
                referencedSinceTime: now,
                mainSoftwareSillId,
                organization,
                targetAudience,
                publicUrl
            })
            .executeTakeFirstOrThrow();
    },
    update: async ({ fromData, instanceId }) => {
        const { mainSoftwareSillId, organization, targetAudience, publicUrl, ...rest } = fromData;
        assert<Equals<typeof rest, {}>>();

        const now = Date.now();
        await db
            .updateTable("instances")
            .set({
                updateTime: now,
                mainSoftwareSillId,
                organization,
                targetAudience,
                publicUrl
            })
            .where("id", "=", instanceId)
            .execute();
    },
    getAll: async () =>
        db
            .selectFrom("instances as i")
            .groupBy(["i.id"])
            .select(["i.id", "i.mainSoftwareSillId", "i.organization", "i.targetAudience", "i.publicUrl"])
            .execute()
            .then(instances =>
                instances.map(
                    (instance): Instance => ({
                        ...instance,
                        publicUrl: instance.publicUrl ?? undefined
                    })
                )
            )
});
