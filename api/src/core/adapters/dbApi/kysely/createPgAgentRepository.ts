import type { Kysely, Selectable } from "kysely";
import { Agent, AgentRepository } from "../../../ports/DbApiV2";
import type { Database } from "./kysely.database";

export const createPgAgentRepository = (db: Kysely<Database>): AgentRepository => ({
    add: async agent => {
        const { id } = await db.insertInto("agents").values(agent).returning("id").executeTakeFirstOrThrow();
        return id;
    },
    update: async agent => {
        await db.updateTable("agents").set(agent).where("id", "=", agent.id).execute();
    },
    remove: async agentId => {
        await db.deleteFrom("agents").where("id", "=", agentId).execute();
    },
    getByEmail: async email => {
        const dbAgent = await db.selectFrom("agents").selectAll().where("email", "=", email).executeTakeFirst();
        if (!dbAgent) return;
        return toAgent(dbAgent);
    },
    getAll: async () =>
        db
            .selectFrom("agents")
            .selectAll()
            .execute()
            .then(dbAgent => dbAgent.map(toAgent))
});

const toAgent = (row: Selectable<Database["agents"]>): Agent => ({
    ...row,
    about: row.about ?? undefined
});
