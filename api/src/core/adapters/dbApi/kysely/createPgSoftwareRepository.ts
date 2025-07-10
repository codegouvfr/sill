// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import { Kysely, sql } from "kysely";
import type { Equals } from "tsafe";
import { assert } from "tsafe/assert";
import { SoftwareRepository } from "../../../ports/DbApiV2";
import { Database } from "./kysely.database";
import { stripNullOrUndefinedValues } from "./kysely.utils";

export const createPgSoftwareRepository = (db: Kysely<Database>): SoftwareRepository => {
    return {
        getAllO: async () => {
            const rows = await db.selectFrom("softwares").selectAll().execute();
            return rows.map(row => stripNullOrUndefinedValues(row));
        },
        getBySoftwareId: async (softwareId: number) => {
            const row = await db
                .selectFrom("softwares")
                .selectAll()
                .where("id", "=", softwareId)
                .executeTakeFirstOrThrow();
            return stripNullOrUndefinedValues(row);
        },
        getByName: async ({ softwareName }) => {
            const row = await db
                .selectFrom("softwares")
                .selectAll()
                .where("name", "=", softwareName)
                .executeTakeFirst();
            return row ? stripNullOrUndefinedValues(row) : row;
        },
        create: async ({ software }) => {
            const {
                name,
                description,
                license,
                logoUrl,
                versionMin,
                referencedSinceTime,
                isStillInObservation,
                dereferencing,
                doRespectRgaa,
                isFromFrenchPublicService,
                isPresentInSupportContract,
                softwareType,
                workshopUrls,
                categories,
                generalInfoMd,
                keywords,
                addedByAgentId,
                ...rest
            } = software;

            assert<Equals<typeof rest, {}>>();

            const now = Date.now();

            return db.transaction().execute(async trx => {
                const { softwareId } = await trx
                    .insertInto("softwares")
                    .values({
                        name,
                        description,
                        license,
                        logoUrl,
                        versionMin,
                        referencedSinceTime,
                        updateTime: now,
                        dereferencing: JSON.stringify(dereferencing),
                        isStillInObservation, // Legacy field from SILL imported
                        doRespectRgaa,
                        isFromFrenchPublicService,
                        isPresentInSupportContract,
                        softwareType: JSON.stringify(softwareType),
                        workshopUrls: JSON.stringify(workshopUrls), // Legacy field from SILL imported
                        categories: JSON.stringify(categories), // Legacy field from SILL imported
                        generalInfoMd, // Legacy field from SILL imported
                        addedByAgentId,
                        keywords: JSON.stringify(keywords)
                    })
                    .returning("id as softwareId")
                    .executeTakeFirstOrThrow();

                return softwareId;
            });
        },
        update: async ({ software, softwareId }) => {
            const {
                name,
                description,
                license,
                logoUrl,
                versionMin,
                dereferencing,
                isStillInObservation,
                doRespectRgaa,
                isFromFrenchPublicService,
                isPresentInSupportContract,
                softwareType,
                workshopUrls,
                categories,
                generalInfoMd,
                keywords,
                addedByAgentId,
                ...rest
            } = software;

            assert<Equals<typeof rest, {}>>();

            const now = Date.now();
            await db
                .updateTable("softwares")
                .set({
                    name,
                    description,
                    license,
                    logoUrl,
                    versionMin,
                    dereferencing: JSON.stringify(dereferencing),
                    updateTime: now,
                    isStillInObservation: false,
                    doRespectRgaa,
                    isFromFrenchPublicService,
                    isPresentInSupportContract,
                    softwareType: JSON.stringify(softwareType),
                    workshopUrls: JSON.stringify(workshopUrls),
                    categories: JSON.stringify(categories),
                    generalInfoMd: generalInfoMd,
                    addedByAgentId,
                    keywords: JSON.stringify(keywords)
                })
                .where("id", "=", softwareId)
                .execute();
        },
        getSoftwareIdByExternalIdAndSlug: async ({ externalId, sourceSlug }) => {
            const result = await db
                .selectFrom("software_external_datas")
                .select("softwareId")
                .where("sourceSlug", "=", sourceSlug)
                .where("externalId", "=", externalId)
                .executeTakeFirst();
            return result?.softwareId ?? undefined;
        },
        getAllSillSoftwareExternalIds: async sourceSlug =>
            db
                .selectFrom("software_external_datas")
                .select("externalId")
                .where("sourceSlug", "=", sourceSlug)
                .execute()
                .then(rows => rows.map(row => row.externalId!)),

        countAddedByAgent: async ({ agentId }) => {
            const { count } = await db
                .selectFrom("softwares")
                .select(qb => qb.fn.countAll<string>().as("count"))
                .where("addedByAgentId", "=", agentId)
                .executeTakeFirstOrThrow();
            return +count;
        },
        unreference: async ({ softwareId, reason, time }) => {
            const { versionMin } = await db
                .selectFrom("softwares")
                .select("versionMin")
                .where("id", "=", softwareId)
                .executeTakeFirstOrThrow();

            await db
                .updateTable("softwares")
                .set({
                    dereferencing: JSON.stringify({
                        reason,
                        time,
                        lastRecommendedVersion: versionMin
                    })
                })
                .where("id", "=", softwareId)
                .executeTakeFirstOrThrow();
        },
        saveSimilarSoftwares: async params => {
            const dataToInsert = params.flatMap(({ softwareId, externalIds }) => {
                return externalIds.map(({ externalId, sourceSlug }) => ({
                    similarExternalId: externalId,
                    sourceSlug,
                    softwareId
                }));
            });

            await db
                .insertInto("software_external_datas")
                .values(
                    dataToInsert.map(({ similarExternalId, sourceSlug }) => ({
                        externalId: similarExternalId,
                        sourceSlug,
                        label: JSON.stringify(""),
                        description: JSON.stringify(""),
                        developers: JSON.stringify([])
                    }))
                )
                .onConflict(oc => oc.doNothing())
                .execute();

            await db.transaction().execute(async trx => {
                await trx
                    .deleteFrom("softwares__similar_software_external_datas")
                    .where(
                        "softwareId",
                        "in",
                        params.map(({ softwareId }) => softwareId)
                    )
                    .execute();

                await trx
                    .insertInto("softwares__similar_software_external_datas")
                    .values(dataToInsert)
                    .onConflict(oc => oc.columns(["softwareId", "sourceSlug", "similarExternalId"]).doNothing())
                    .execute();
            });
        },
        getSimilarSoftwareExternalDataPks: async ({ softwareId }) => {
            const similarIds = await db
                .selectFrom("softwares__similar_software_external_datas as similar")
                .innerJoin("software_external_datas as ext", "ext.externalId", "similar.similarExternalId")
                .select(["ext.softwareId", "ext.externalId", "ext.sourceSlug"])
                .where("similar.softwareId", "=", softwareId)
                .execute();

            return similarIds.map(({ externalId, sourceSlug, softwareId }) => ({
                externalId,
                sourceSlug,
                softwareId: softwareId ?? undefined
            }));
        },
        getUserAndReferentCountByOrganization: async ({ softwareId }) => {
            const softwareUserCount = await db
                .selectFrom("software_users as u")
                .innerJoin("agents as a", "a.id", "u.agentId")
                .select([
                    "a.organization",
                    ({ fn }) => fn.countAll<string>().as("count"),
                    sql<"user">`'userCount'`.as("type")
                ])
                .groupBy(["a.organization"])
                .where("u.softwareId", "=", softwareId)
                .execute();

            const softwareReferentCount = await db
                .selectFrom("software_referents as r")
                .innerJoin("agents as a", "a.id", "r.agentId")
                .select([
                    "a.organization",
                    ({ fn }) => fn.countAll<string>().as("count"),
                    sql<"referent">`'referentCount'`.as("type")
                ])
                .groupBy(["a.organization"])
                .where("r.softwareId", "=", softwareId)
                .execute();

            return [...softwareUserCount, ...softwareReferentCount].reduce(
                (acc, value) => {
                    const orga = value.organization ?? "NO_ORGANIZATION";
                    const data =
                        value.type == "referent"
                            ? { referentCount: Number(value.count) }
                            : { userCount: Number(value.count) };

                    if (Object.hasOwn(acc, orga)) acc[orga] = Object.assign(acc[orga], data);
                    else acc[orga] = Object.assign(defaultCount, data);

                    return acc;
                },
                {} as Record<
                    string,
                    {
                        userCount: number;
                        referentCount: number;
                    }
                >
            );

            const allCount = await getUserAndReferentCountByOrganizationBySoftwareId(db);
            return allCount[softwareId];
        }
    };
};

type CountForOrganisationAndSoftwareId = {
    organization: string | null;
    softwareId: number;
    type: "user" | "referent";
    count: string;
};

type UserAndReferentCountByOrganizationBySoftwareId = Record<
    string,
    Record<string, { userCount: number; referentCount: number }>
>;

const defaultCount = {
    userCount: 0,
    referentCount: 0
};

const getUserAndReferentCountByOrganizationBySoftwareId = async (
    db: Kysely<Database>
): Promise<UserAndReferentCountByOrganizationBySoftwareId> => {
    const softwareUserCountBySoftwareId: CountForOrganisationAndSoftwareId[] = await db
        .selectFrom("software_users as u")
        .innerJoin("agents as a", "a.id", "u.agentId")
        .select([
            "u.softwareId",
            "a.organization",
            ({ fn }) => fn.countAll<string>().as("count"),
            sql<"user">`'userCount'`.as("type")
        ])
        .groupBy(["a.organization", "u.softwareId"])
        .execute();

    const softwareReferentCountBySoftwareId: CountForOrganisationAndSoftwareId[] = await db
        .selectFrom("software_referents as r")
        .innerJoin("agents as a", "a.id", "r.agentId")
        .select([
            "r.softwareId",
            "a.organization",
            ({ fn }) => fn.countAll<string>().as("count"),
            sql<"referent">`'referentCount'`.as("type")
        ])
        .groupBy(["a.organization", "r.softwareId"])
        .execute();

    return [...softwareReferentCountBySoftwareId, ...softwareUserCountBySoftwareId].reduce(
        (acc, { organization, softwareId, type, count }): UserAndReferentCountByOrganizationBySoftwareId => {
            const orga = organization ?? "NO_ORGANIZATION";
            return {
                ...acc,
                [softwareId]: {
                    ...(acc[softwareId] ?? {}),
                    [orga]: {
                        ...(acc[softwareId]?.[orga] ?? defaultCount),
                        [type]: +count
                    }
                }
            };
        },
        {} as UserAndReferentCountByOrganizationBySoftwareId
    );
};
