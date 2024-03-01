import { symToStr } from "tsafe/symToStr";
import { assert } from "tsafe/assert";
import * as JSONC from "comment-json";
import { z } from "zod";
import { zLocalizedString } from "./core/ports/GetSoftwareExternalData";
import { is } from "tsafe/is";

const zParsedCONFIGURATION = z.object({
    "keycloakParams": z
        .object({
            "url": z.string().nonempty(), //Example: https://auth.code.gouv.fr/auth (with the /auth at the end)
            "realm": z.string().nonempty(),
            "clientId": z.string().nonempty(),
            "adminPassword": z.string().nonempty(),
            "organizationUserProfileAttributeName": z.string().nonempty()
        })
        .optional(),
    "termsOfServiceUrl": zLocalizedString,
    "readmeUrl": zLocalizedString,
    "jwtClaimByUserKey": z.object({
        "id": z.string().nonempty(),
        "email": z.string().nonempty(),
        "organization": z.string().nonempty()
    }),
    "dataRepoSshUrl": z.string().nonempty(),
    // Like id_ed25537
    "sshPrivateKeyForGitName": z.string().nonempty(),
    // Like -----BEGIN OPENSSH PRIVATE KEY-----\nxxx ... xxx\n-----END OPENSSH PRIVATE KEY-----\n
    // You can a fake key in .env.local.sh for running yarn dev
    "sshPrivateKeyForGit": z.string().nonempty(),
    "githubWebhookSecret": z.string().nonempty().optional(),
    // Only for increasing the rate limit on GitHub API
    // we use the GitHub API for pre filling the version when adding a software
    "githubPersonalAccessTokenForApiRateLimit": z.string().nonempty(),
    //Port we listen to, default 8080
    "port": z.number().optional(),
    "isDevEnvironnement": z.boolean().optional(),
    // Completely disable this instance and redirect to another url
    "redirectUrl": z.string().optional(),
    "externalSoftwareDataOrigin": z.enum(["wikidata", "HAL"]).optional()
});

const { parsedCONFIGURATION } = (() => {
    const { CONFIGURATION } = process.env;

    if (CONFIGURATION === undefined) {
        throw new Error(
            `We need a ${symToStr({
                CONFIGURATION
            })} environnement variable`
        );
    }

    let parsedCONFIGURATION: unknown;

    try {
        parsedCONFIGURATION = JSONC.parse(CONFIGURATION) as any;
    } catch (error) {
        throw new Error(
            `The CONFIGURATION environnement variable is not a valid JSONC string (JSONC = JSON + Comment support)\n${CONFIGURATION}: ${String(
                error
            )}`
        );
    }

    zParsedCONFIGURATION.parse(parsedCONFIGURATION);

    assert(is<ReturnType<(typeof zParsedCONFIGURATION)["parse"]>>(parsedCONFIGURATION));

    return { parsedCONFIGURATION };
})();

export const env = {
    ...parsedCONFIGURATION,
    "port": parsedCONFIGURATION.port ?? 8080,
    "isDevEnvironnement": parsedCONFIGURATION.isDevEnvironnement ?? false,
    "externalSoftwareDataOrigin": parsedCONFIGURATION.externalSoftwareDataOrigin ?? ("wikidata" as const)
};
