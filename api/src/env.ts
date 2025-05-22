import { z } from "zod";
import { zLocalizedString } from "./core/ports/GetSoftwareExternalData";

const zEnvConfiguration = z.object({
    "oidcParams": z.object({
        "issuerUri": z.string().nonempty(),
        "clientId": z.string().nonempty()
    }),
    "termsOfServiceUrl": zLocalizedString,
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
        "issuerUri": process.env.OIDC_ISSUER_URI,
        "clientId": process.env.OIDC_CLIENT_ID
    },
    "termsOfServiceUrl": process.env.TERMS_OF_SERVICE_URL,
    "port": parseInt(process.env.API_PORT ?? ""),
    "isDevEnvironnement": process.env.IS_DEV_ENVIRONNEMENT?.toLowerCase() === "true",
    "externalSoftwareDataOrigin": process.env.EXTERNAL_SOFTWARE_DATA_ORIGIN,
    "redirectUrl": process.env.REDIRECT_URL,
    "databaseUrl": process.env.DATABASE_URL,
    "initializeSoftwareFromSource": process.env.INIT_SOFT_FROM_SOURCE?.toLowerCase() === "true",
    "botAgentEmail": process.env?.BOT_AGENT_EMAIL,
    "listToImport": process.env?.IMPORT_WIKIDATA?.split(",")
});

export const env = {
    ...envConfiguration,
    "isDevEnvironnement": envConfiguration.isDevEnvironnement ?? false
};
