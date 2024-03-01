import type { ZodObject } from "zod";

export function parsedJwtPayloadToUser<ZUser extends ZodObject<any>>(params: {
    zUser: ZUser;
    jwtClaimByUserKey: Record<keyof ReturnType<ZUser["parse"]>, string>;
    parsedJwtPayload: Record<string, unknown>;
}): ReturnType<ZUser["parse"]> {
    const { zUser, jwtClaimByUserKey, parsedJwtPayload } = params;

    return zUser.parse(
        Object.fromEntries(
            Object.entries(jwtClaimByUserKey).map(([key, claimName]) => [key, parsedJwtPayload[claimName]])
        )
    ) as any;
}

/*
import { z } from "zod";
const user = parsedJwtToUser({
    "zUser": z.object({
        "names": z.array(z.string()),
        "birth": z.number()
    }),
    "jwtClaimByUserKey": {
        "names": "first_names",
        "birth": "birth_time"
    } as const,
    "parsedJwtPayload": {
        "first_names": ["John", "Jane"],
        "birth_time": 123456789
    }
});
*/
