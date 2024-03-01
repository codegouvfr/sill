import type { GetUser, User } from "core/ports/GetUser";
import { createAccessTokenToUser } from "@codegouvfr/sill";
import { decodeJwt } from "core/tools/jwt";

export function createGetUser(params: {
    jwtClaimByUserKey: Record<keyof User, string>;
    getOidcAccessToken: () => string;
}) {
    const { jwtClaimByUserKey, getOidcAccessToken } = params;

    const { accessTokenToUser } = createAccessTokenToUser({
        decodeJwt,
        jwtClaimByUserKey
    });

    const getUser: GetUser = async () =>
        accessTokenToUser({
            "accessToken": getOidcAccessToken()
        });

    return { getUser };
}
