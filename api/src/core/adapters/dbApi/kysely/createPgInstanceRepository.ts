import { Kysely } from "kysely";
import type { Equals } from "tsafe";
import { assert } from "tsafe/assert";
import { InstanceRepository } from "../../../ports/DbApiV2";
import { ParentSoftwareExternalData } from "../../../ports/GetSoftwareExternalData";
import { Instance } from "../../../usecases/readWriteSillData";
import { Database } from "./kysely.database";
import { jsonBuildObject } from "./kysely.utils";

export const createPgInstanceRepository = (db: Kysely<Database>): InstanceRepository => ({
    create: async ({ fromData, agentEmail }) => {
        const { mainSoftwareSillId, organization, targetAudience, publicUrl, otherSoftwareWikidataIds, ...rest } =
            fromData;
        assert<Equals<typeof rest, {}>>();

        const now = Date.now();

        await db.transaction().execute(async trx => {
            const { instanceId } = await trx
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
                .returning("id as instanceId")
                .executeTakeFirstOrThrow();

            if (otherSoftwareWikidataIds.length === 0) return;
            await trx
                .insertInto("instances__other_external_softwares")
                .values(
                    otherSoftwareWikidataIds.map(externalId => ({
                        instanceId,
                        externalId
                    }))
                )
                .execute();
        });
    },
    update: async ({ fromData, instanceId }) => {
        const { mainSoftwareSillId, organization, targetAudience, publicUrl, otherSoftwareWikidataIds, ...rest } =
            fromData;
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
            .leftJoin("instances__other_external_softwares as ioes", "ioes.instanceId", "i.id")
            .leftJoin("software_external_datas as ext", "ext.externalId", "ioes.externalId")
            .groupBy(["i.id"])
            .select([
                "i.id",
                "i.mainSoftwareSillId",
                "i.organization",
                "i.targetAudience",
                "i.publicUrl",
                // ({ fn }) =>
                //     fn
                //         .jsonAgg("ext")
                //         .filterWhere("ext.externalId", "is not", null)
                //         .distinct()
                //         .$castTo<ParentSoftwareExternalData[]>()
                //         .as("otherWikidataSoftwares")
                ({ ref, fn }) =>
                    fn
                        .jsonAgg(
                            jsonBuildObject({
                                externalId: ref("ext.externalId"),
                                label: ref("ext.label"),
                                description: ref("ext.description")
                            }).$castTo<ParentSoftwareExternalData>()
                        )
                        .filterWhere("ext.externalId", "is not", null)
                        .as("otherWikidataSoftwares")
            ])
            .execute()
            .then(instances =>
                instances.map(
                    (instance): Instance => ({
                        ...instance,
                        publicUrl: instance.publicUrl ?? undefined,
                        otherWikidataSoftwares: instance.otherWikidataSoftwares
                    })
                )
            )
});
