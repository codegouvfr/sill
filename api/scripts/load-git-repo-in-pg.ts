import { InsertObject, Kysely, sql } from "kysely";
import { z } from "zod";
import { createGitDbApi, GitDbApiParams } from "../src/core/adapters/dbApi/createGitDbApi";
import { makeGetAgentIdByEmail } from "../src/core/adapters/dbApi/kysely/createPgAgentRepository";
import { Database } from "../src/core/adapters/dbApi/kysely/kysely.database";
import { createPgDialect } from "../src/core/adapters/dbApi/kysely/kysely.dialect";
import { CompiledData } from "../src/core/ports/CompileData";
import { Db } from "../src/core/ports/DbApi";
import { ExternalDataOrigin } from "../src/core/ports/GetSoftwareExternalData";
import { Source } from "../src/core/usecases/readWriteSillData";

export type Params = {
    pgConfig: { dbUrl: string };
    gitDbConfig: GitDbApiParams;
};

const saveGitDbInPostgres = async ({ pgConfig, gitDbConfig }: Params) => {
    const { dbApi: gitDbApi } = createGitDbApi(gitDbConfig);
    if (!pgConfig.dbUrl) throw new Error("Missing PG database url, please set the DATABASE_URL environnement variable");
    const pgDb = new Kysely<Database>({ dialect: createPgDialect(pgConfig.dbUrl) });

    const { softwareRows, agentRows, softwareReferentRows, softwareUserRows, instanceRows } = await gitDbApi.fetchDb();

    const mainSource = await pgDb.selectFrom("sources").selectAll().orderBy("priority", "desc").executeTakeFirst();

    if (!mainSource) throw new Error("No source found, there should be at least one source");

    await insertAgents(agentRows, pgDb);

    const agentIdByEmail = await makeGetAgentIdByEmail(pgDb);

    await insertSoftwares({
        softwareRows: softwareRows,
        agentIdByEmail: agentIdByEmail,
        db: pgDb,
        mainSource
    });
    await insertSoftwareReferents({
        softwareReferentRows: softwareReferentRows,
        agentIdByEmail,
        db: pgDb
    });
    await insertSoftwareUsers({
        softwareUserRows: softwareUserRows,
        agentIdByEmail,
        db: pgDb
    });
    await insertInstances({
        instanceRows: instanceRows,
        agentIdByEmail,
        db: pgDb
    });

    const compiledSoftwares = await gitDbApi.fetchCompiledData();
    await insertCompiledSoftwaresAndSoftwareExternalData({
        compiledSoftwares: compiledSoftwares,
        pgDb: pgDb,
        mainSource
    });
};

const insertSoftwares = async ({
    softwareRows,
    agentIdByEmail,
    db,
    mainSource
}: {
    softwareRows: Db.SoftwareRow[];
    agentIdByEmail: Record<string, number>;
    db: Kysely<Database>;
    mainSource: Source;
}) => {
    console.info("Deleting than Inserting softwares");
    console.info("Number of softwares to insert : ", softwareRows.length);
    await db.transaction().execute(async trx => {
        await trx.deleteFrom("softwares").execute();
        await trx.deleteFrom("softwares__similar_software_external_datas").execute();
        await trx
            .insertInto("softwares")
            .values(
                softwareRows.map(originalRow => {
                    const {
                        // @ts-ignore
                        similarSoftwareExternalDataIds,
                        // @ts-ignore
                        testUrls,
                        // @ts-ignore
                        parentSoftwareWikidataId,
                        // @ts-ignore
                        catalogNumeriqueGouvFrId,
                        addedByAgentEmail,
                        ...row
                    } = originalRow;

                    return {
                        ...row,
                        addedByAgentId: agentIdByEmail[addedByAgentEmail],
                        dereferencing: row.dereferencing ? JSON.stringify(row.dereferencing) : null,
                        softwareType: JSON.stringify(row.softwareType),
                        workshopUrls: JSON.stringify(row.workshopUrls),
                        categories: JSON.stringify(row.categories),
                        keywords: JSON.stringify(row.keywords)
                    };
                })
            )
            .executeTakeFirst();
        await sql`SELECT setval('softwares_id_seq', (SELECT MAX(id) FROM softwares))`.execute(trx);

        await trx
            .insertInto("softwares__similar_software_external_datas")
            .values(
                softwareRows.flatMap(row =>
                    Array.from(new Set(row.similarSoftwareExternalDataIds)).map(externalId => ({
                        softwareId: row.id,
                        similarExternalId: externalId,
                        sourceSlug: mainSource.slug
                    }))
                )
            )
            .execute();
    });
};

const insertAgents = async (agentRows: Db.AgentRow[], db: Kysely<Database>) => {
    console.log("Deleting than Inserting agents");
    console.info("Number of agents to insert : ", agentRows.length);
    await db.transaction().execute(async trx => {
        await trx.deleteFrom("instances").execute();
        await trx.deleteFrom("softwares").execute();
        await trx.deleteFrom("agents").execute();
        await trx.insertInto("agents").values(agentRows).executeTakeFirst();
        await sql`SELECT setval('agents_id_seq', (SELECT MAX(id) FROM agents))`.execute(trx);
    });
};

const insertSoftwareReferents = async ({
    softwareReferentRows,
    agentIdByEmail,
    db
}: {
    softwareReferentRows: Db.SoftwareReferentRow[];
    agentIdByEmail: Record<string, number>;
    db: Kysely<Database>;
}) => {
    console.info("Deleting than Inserting software referents");
    console.info("Number of software referents to insert : ", softwareReferentRows.length);
    await db.transaction().execute(async trx => {
        await trx.deleteFrom("software_referents").execute();
        await trx
            .insertInto("software_referents")
            .values(
                softwareReferentRows.map(({ agentEmail, ...rest }) => ({
                    ...rest,
                    agentId: agentIdByEmail[agentEmail]
                }))
            )
            .executeTakeFirst();
    });
};

const insertSoftwareUsers = async ({
    softwareUserRows,
    agentIdByEmail,
    db
}: {
    softwareUserRows: Db.SoftwareUserRow[];
    agentIdByEmail: Record<string, number>;
    db: Kysely<Database>;
}) => {
    console.info("Deleting than Inserting software users");
    console.info("Number of software users to insert : ", softwareUserRows.length);
    await db.transaction().execute(async trx => {
        await trx.deleteFrom("software_users").execute();
        await trx
            .insertInto("software_users")
            .values(
                softwareUserRows.map(({ agentEmail, ...rest }) => ({
                    ...rest,
                    agentId: agentIdByEmail[agentEmail]
                }))
            )
            .executeTakeFirst();
    });
};

const insertInstances = async ({
    instanceRows,
    agentIdByEmail,
    db
}: {
    instanceRows: Db.InstanceRow[];
    agentIdByEmail: Record<string, number>;
    db: Kysely<Database>;
}) => {
    console.info("Deleting than Inserting instances");
    console.info("Number of instances to insert : ", instanceRows.length);
    await db.transaction().execute(async trx => {
        await trx.deleteFrom("instances").execute();
        await trx
            .insertInto("instances")
            .values(
                instanceRows.map(({ addedByAgentEmail, publicUrl, ...instanceRow }) => ({
                    ...instanceRow,
                    instanceUrl: publicUrl,
                    isPublic: !!publicUrl,
                    addedByAgentId: agentIdByEmail[addedByAgentEmail]
                }))
            )
            .executeTakeFirst();
        await sql`SELECT setval('instances_id_seq', (SELECT MAX(id) FROM instances))`.execute(trx);
    });
};

const insertCompiledSoftwaresAndSoftwareExternalData = async ({
    compiledSoftwares,
    pgDb,
    mainSource
}: {
    compiledSoftwares: CompiledData.Software<"private">[];
    pgDb: Kysely<Database>;
    mainSource: Source;
}) => {
    console.info("Deleting than Inserting compiled softwares");
    console.info("Number of compiled softwares to insert : ", compiledSoftwares.length);
    await pgDb.transaction().execute(async trx => {
        await trx.deleteFrom("compiled_softwares").execute();
        await trx
            .insertInto("compiled_softwares")
            .values(
                compiledSoftwares.map(
                    (software): InsertObject<Database, "compiled_softwares"> => ({
                        softwareId: software.id,
                        serviceProviders: JSON.stringify(software.serviceProviders),
                        comptoirDuLibreSoftware: JSON.stringify(software.comptoirDuLibreSoftware),
                        annuaireCnllServiceProviders: JSON.stringify(software.annuaireCnllServiceProviders),
                        latestVersion: JSON.stringify(software.latestVersion)
                    })
                )
            )
            .executeTakeFirst();

        await trx.deleteFrom("software_external_datas").execute();

        await trx
            .insertInto("software_external_datas")
            .values(
                compiledSoftwares
                    .filter(
                        (
                            software
                        ): software is CompiledData.Software.Private & {
                            softwareExternalData: {
                                externalId: string;
                                externalDataOrigin: ExternalDataOrigin;
                            };
                        } =>
                            software.softwareExternalData?.externalId !== undefined &&
                            software.softwareExternalData?.sourceSlug !== undefined
                    )
                    .map(
                        ({ softwareExternalData }): InsertObject<Database, "software_external_datas"> => ({
                            externalId: softwareExternalData.externalId,
                            sourceSlug: mainSource.slug,
                            developers: JSON.stringify(softwareExternalData?.developers ?? []),
                            label: JSON.stringify(softwareExternalData?.label ?? {}),
                            description: JSON.stringify(softwareExternalData?.description ?? {}),
                            isLibreSoftware: softwareExternalData?.isLibreSoftware ?? false,
                            logoUrl: softwareExternalData?.logoUrl ?? null,
                            websiteUrl: softwareExternalData?.websiteUrl ?? null,
                            sourceUrl: softwareExternalData?.sourceUrl ?? null,
                            documentationUrl: softwareExternalData?.documentationUrl ?? null,
                            license: softwareExternalData?.license ?? null
                        })
                    )
            )
            .onConflict(conflict => conflict.column("externalId").doNothing())
            .executeTakeFirst();

        await trx
            .insertInto("software_external_datas")
            .values(
                compiledSoftwares
                    .filter(s => s.similarExternalSoftwares.length > 0)
                    .flatMap(s =>
                        (s.similarExternalSoftwares ?? []).map(similarExternalSoftware => ({
                            externalId: similarExternalSoftware.externalId,
                            sourceSlug: similarExternalSoftware.sourceSlug,
                            developers: JSON.stringify([]),
                            label: JSON.stringify(similarExternalSoftware?.label ?? {}),
                            description: JSON.stringify(similarExternalSoftware?.description ?? {}),
                            isLibreSoftware: similarExternalSoftware?.isLibreSoftware ?? false
                        }))
                    )
            )
            .onConflict(conflict => conflict.column("externalId").doNothing())
            .executeTakeFirst();
    });
};

const paramsSchema: z.Schema<Params> = z.object({
    pgConfig: z.object({
        dbUrl: z.string()
    }),
    gitDbConfig: z.object({
        dataRepoSshUrl: z.string(),
        sshPrivateKey: z.string(),
        sshPrivateKeyName: z.string()
    })
});

const timerName = "Script duration";
console.time(timerName);

saveGitDbInPostgres(
    paramsSchema.parse({
        pgConfig: { dbUrl: process.env.DATABASE_URL },
        gitDbConfig: {
            dataRepoSshUrl: process.env.SILL_DATA_REPO_SSH_URL,
            sshPrivateKey: process.env.SILL_SSH_PRIVATE_KEY,
            sshPrivateKeyName: process.env.SILL_SSH_NAME
        }
    })
)
    .then(() => {
        console.log("Load git db in postgres with success");
        process.exit(0);
    })
    .finally(() => console.timeEnd(timerName));
