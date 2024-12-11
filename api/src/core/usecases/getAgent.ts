import { TRPCError } from "@trpc/server";
import { User } from "../../rpc/user";
import { AgentRepository, AgentWithId } from "../ports/DbApiV2";

type GetAgentDependencies = {
    agentRepository: AgentRepository;
};

type GetAgentParams = {
    email: string;
    currentUser: User | undefined;
};

export type GetAgent = ReturnType<typeof makeGetAgent>;
export const makeGetAgent =
    ({ agentRepository }: GetAgentDependencies) =>
    async ({ email, currentUser }: GetAgentParams): Promise<{ agent: AgentWithId }> => {
        const agent = await agentRepository.getByEmail(email);

        if (currentUser) {
            if (agent) return { agent };
            if (currentUser.email === email) {
                const agentWithoutId = {
                    email: currentUser.email,
                    organization: null,
                    about: "",
                    isPublic: false
                };
                const agentId = await agentRepository.add(agentWithoutId);
                return {
                    agent: {
                        id: agentId,
                        ...agentWithoutId,
                        declarations: []
                    }
                };
            }

            throw new TRPCError({
                "code": "NOT_FOUND",
                message: "Agent not found"
            });
        }

        if (!agent)
            throw new TRPCError({
                "code": "NOT_FOUND",
                message: "Agent not found"
            });

        if (!agent?.isPublic) throw new TRPCError({ "code": "UNAUTHORIZED" });

        return { agent };
    };
