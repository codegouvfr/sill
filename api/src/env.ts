import * as JSONC from "comment-json";
import { z } from "zod";
import { zLocalizedString } from "./core/ports/GetSoftwareExternalData";

const zConfiguration = z.object({
    "oidcParams": z.object({
        "issuerUri": z.string().nonempty(),
        "clientId": z.string().nonempty()
    }),
    "termsOfServiceUrl": zLocalizedString,
    "readmeUrl": zLocalizedString,
    // Only for increasing the rate limit on GitHub API
    // we use the GitHub API for pre filling the version when adding a software
    "githubPersonalAccessTokenForApiRateLimit": z.string().nonempty(),
    //Port we listen to, default 8080
    "port": z.coerce.number().optional(),
    "isDevEnvironnement": z.boolean().optional(),
    // Completely disable this instance and redirect to another url
    "redirectUrl": z.string().optional(),
    "externalSoftwareDataOrigin": z.enum(["wikidata", "HAL"]).optional(),
    "databaseUrl": z.string(),
    "initializeSoftwareFromSource": z.boolean(),
    "botAgentEmail": z.string().optional(),
    "listToImport": z.array(z.string()).optional()
});

const getJsonConfiguration = () => {
    const { CONFIGURATION } = process.env;
    if (CONFIGURATION) {
        try {
            return JSONC.parse(CONFIGURATION) as any;
        } catch (error) {
            throw new Error(
                `The CONFIGURATION environnement variable is not a valid JSONC string (JSONC = JSON + Comment support)\n${CONFIGURATION}: ${String(
                    error
                )}`
            );
        }
    }

    return {
        "oidcParams": {
            "issuerUri":
                process.env.OIDC_ISSUER_URI ??
                `${process.env.SILL_KEYCLOAK_URL}/realms/${process.env.SILL_KEYCLOAK_REALM}`,
            "clientId": process.env.OIDC_CLIENT_ID ?? process.env.SILL_KEYCLOAK_CLIENT_ID
        },
        "readmeUrl": process.env.SILL_README_URL,
        "termsOfServiceUrl": process.env.SILL_TERMS_OF_SERVICE_URL,
        "githubPersonalAccessTokenForApiRateLimit": process.env.SILL_GITHUB_TOKEN,
        "port": parseInt(process.env.SILL_API_PORT ?? ""),
        "isDevEnvironnement": process.env.SILL_IS_DEV_ENVIRONNEMENT?.toLowerCase() === "true",
        "externalSoftwareDataOrigin": process.env.SILL_EXTERNAL_SOFTWARE_DATA_ORIGIN,
        "redirectUrl": process.env.SILL_REDIRECT_URL,
        "databaseUrl": process.env.DATABASE_URL,
        "initializeSoftwareFromSource": process.env.INIT_SOFT_FROM_SOURCE?.toLowerCase() === "true",
        "botAgentEmail": process.env?.BOT_AGENT_EMAIL,
        "listToImport": process.env?.SILL_IMPORT_WIKIDATA?.split(",")
    };
};

const getValidConfiguration = (): z.infer<typeof zConfiguration> => {
    const configuration = getJsonConfiguration();
    return zConfiguration.parse(configuration);
};

const parsedCONFIGURATION = getValidConfiguration();

export const env = {
    ...parsedCONFIGURATION,
    "port": parsedCONFIGURATION.port ?? 8080,
    "isDevEnvironnement": parsedCONFIGURATION.isDevEnvironnement ?? false,
    "externalSoftwareDataOrigin": parsedCONFIGURATION.externalSoftwareDataOrigin ?? ("wikidata" as const)
};
