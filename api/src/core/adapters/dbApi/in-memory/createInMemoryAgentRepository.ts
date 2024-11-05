import { AgentRepository, DbAgent } from "../../../ports/DbApiV2";

type DbAgentWithId = DbAgent & Pick<DbAgent, "id">;

export type AgentRepositoryHelpers = {
    setAgents: (newAgents: DbAgentWithId[]) => void;
    agents: DbAgentWithId[];
};

export const createInMemoryAgentRepository = (): {
    agentRepository: AgentRepository;
    testHelpers: AgentRepositoryHelpers;
} => {
    let id = 1;
    let agents: DbAgentWithId[] = [];

    return {
        agentRepository: {
            add: async agent => agents.push({ id: id++, ...agent }),
            update: _ => {
                throw new Error("Not implemented");
            },
            remove: _ => {
                throw new Error("Not implemented");
            },
            getByEmail: async email => {
                const agent = agents.find(agent => agent.email === email);
                if (!agent) return;
                return { ...agent, declarations: [] };
            },
            getAll: () => {
                throw new Error("Not implemented");
            }
        },
        testHelpers: {
            setAgents: (newAgents: DbAgentWithId[]) => {
                agents.length = 0;
                agents.push(...newAgents);
            },
            agents
        }
    };
};
