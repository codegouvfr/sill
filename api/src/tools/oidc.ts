// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import { TRPCError } from "@trpc/server";
import { createOidcBackend } from "oidc-spa/backend";
import { z } from "zod";

export type OidcParams = {
    issuerUri: string;
    clientId: string;
};

export async function createDecodeAccessToken(issuerUri: string) {
    const { verifyAndDecodeAccessToken } = await createOidcBackend({
        issuerUri,
        decodedAccessTokenSchema: z.object({
            sub: z.string(),
            email: z.string()
        })
    });

    function decodeAccessToken(params: { authorizationHeaderValue: string | undefined }) {
        const { authorizationHeaderValue } = params;

        if (authorizationHeaderValue === undefined) {
            throw new TRPCError({ "code": "UNAUTHORIZED" });
        }

        const result = verifyAndDecodeAccessToken({
            accessToken: authorizationHeaderValue.replace(/^Bearer /, "")
        });

        if (!result.isValid) {
            switch (result.errorCase) {
                case "does not respect schema":
                    throw new Error(`The access token does not respect the schema ${result.errorMessage}`);
                case "invalid signature":
                case "expired":
                    throw new TRPCError({ "code": "UNAUTHORIZED" });
            }
        }

        const { decodedAccessToken } = result;

        return decodedAccessToken;
    }

    return { decodeAccessToken };
}
