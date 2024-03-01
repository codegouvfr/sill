import { z } from "zod";
import { assert, type Equals } from "tsafe/assert";
import { parsedJwtPayloadToUser } from "../tools/parsedJwtPayloadToUser";

export type User = {
    id: string;
    email: string;
    organization: string;
};

const zUser = z.object({
    "id": z.string(),
    "email": z.string(),
    "organization": z.string()
});

{
    type Got = ReturnType<(typeof zUser)["parse"]>;
    type Expected = User;

    assert<Equals<Got, Expected>>();
}

export function createAccessTokenToUser(params: {
    decodeJwt: (accessToken: string) => Record<string, unknown>;
    jwtClaimByUserKey: Record<keyof User, string>;
}) {
    const { decodeJwt, jwtClaimByUserKey } = params;

    function accessTokenToUser(params: { accessToken: string }): User {
        const { accessToken } = params;

        const user = parsedJwtPayloadToUser({
            zUser,
            "parsedJwtPayload": decodeJwt(accessToken),
            jwtClaimByUserKey
        });

        user.email = user.email.toLowerCase();

        return user;
    }

    return { accessTokenToUser };
}
