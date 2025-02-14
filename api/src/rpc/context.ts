import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { createDecodeAccessToken, OidcParams } from "../tools/oidc";
import { type User } from "./user";

export type Context = {
    user?: User;
};

export async function createContextFactory(params: { oidcParams: Pick<OidcParams, "issuerUri"> }) {
    const { oidcParams } = params;

    const { decodeAccessToken } = await createDecodeAccessToken(oidcParams.issuerUri);

    async function createContext({ req }: CreateExpressContextOptions): Promise<Context> {
        const { authorization } = req.headers;

        if (!authorization) {
            return {};
        }

        const { sub, email } = decodeAccessToken({ authorizationHeaderValue: authorization });

        return { user: { id: sub, email } };
    }

    return { createContext };
}
