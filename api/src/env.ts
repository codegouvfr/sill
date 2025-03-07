import { z } from "zod";
import { zLocalizedString } from "./core/ports/GetSoftwareExternalData";

const zEnvConfiguration = z.object({
    "oidcParams": z.object({
        "issuerUri": z.string().nonempty(),
        "clientId": z.string().nonempty()
    }),
    "termsOfServiceUrl": zLocalizedString,
    "readmeUrl": zLocalizedString,
    // Only for increasing the rate limit on GitHub API
    // we use the GitHub API for pre filling the version when adding a software
    "githubPersonalAccessTokenForApiRateLimit": z.string().nonempty(),
    //Port we listen to
    "port": z.coerce.number().optional().default(8080),
    "isDevEnvironnement": z.boolean().optional(),
    // Completely disable this instance and redirect to another url
    "redirectUrl": z.string().optional(),
    "externalSoftwareDataOrigin": z.enum(["wikidata", "HAL"]).optional().default("wikidata"),
    "databaseUrl": z.string(),
    "initializeSoftwareFromSource": z.boolean(),
    "botAgentEmail": z.string().optional(),
    "listToImport": z.array(z.string()).optional()
});

const envConfiguration = zEnvConfiguration.parse({
    "oidcParams": {
        "issuerUri":
            process.env.OIDC_ISSUER_URI ?? `${process.env.SILL_KEYCLOAK_URL}/realms/${process.env.SILL_KEYCLOAK_REALM}`,
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
});

export const env = {
    ...envConfiguration,
    "isDevEnvironnement": envConfiguration.isDevEnvironnement ?? false
};
