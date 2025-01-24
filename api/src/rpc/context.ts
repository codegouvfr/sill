import { OidcParams } from "../env";
import { createValidateKeycloakSignature } from "../tools/createValidateKeycloakSignature";
import * as jwtSimple from "jwt-simple";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { type User, createAccessTokenToUser } from "./user";

export type Context = {
    user?: User;
};

export function createContextFactory(params: {
    jwtClaimByUserKey: Record<keyof User, string>;
    oidcParams: OidcParams | undefined;
}) {
    const { jwtClaimByUserKey, oidcParams } = params;

    const { accessTokenToUser } = createAccessTokenToUser({
        "decodeJwt": accessToken => jwtSimple.decode(accessToken, "", true),
        jwtClaimByUserKey
    });

    const { validateKeycloakSignature } =
        oidcParams !== undefined
            ? createValidateKeycloakSignature(oidcParams)
            : { "validateKeycloakSignature": undefined };

    async function createContext({ req }: CreateExpressContextOptions): Promise<Context> {
        const { authorization } = req.headers;

        if (!authorization) {
            return {};
        }

        const accessToken = authorization.split(" ")[1];

        await validateKeycloakSignature?.({ accessToken });

        const user = accessTokenToUser({ accessToken });

        return { user };
    }

    return { createContext };
}
