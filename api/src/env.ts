// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import { z } from "zod";

const zEnvConfiguration = z.object({
    "oidcParams": z.object({
        "issuerUri": z.string().nonempty(),
        "clientId": z.string().nonempty()
    }),
    "databaseUrl": z.string(),
    "isDevEnvironnement": z.boolean().default(false),
    "port": z.coerce.number().optional().default(8080),
    "isDevEnvironnement": z.boolean().optional(),
    // Completely disable this instance and redirect to another url
    "redirectUrl": z.string().optional(),
    "importDataSourceOrigin": z.string().optional().default("wikidata"),
    "databaseUrl": z.string(),
    "botAgentEmail": z.string().optional(),
    "listToImport": z.array(z.string()).optional(),
    "updateSkipTimingInMinutes": z.number().optional(),
    // Completely disable this instance and redirect to another url
    "redirectUrl": z.string().optional()
});

const envConfiguration = zEnvConfiguration.parse({
    "oidcParams": {
        "issuerUri": process.env.OIDC_ISSUER_URI,
        "clientId": process.env.OIDC_CLIENT_ID
    },
    "port": parseInt(process.env.API_PORT ?? ""),
    "isDevEnvironnement": process.env.IS_DEV_ENVIRONNEMENT?.toLowerCase() === "true",
    "importDataSourceOrigin": process.env.IMPORT_DATA_SOURCE_ORIGIN,
    "redirectUrl": process.env.REDIRECT_URL,
    "databaseUrl": process.env.DATABASE_URL,
    "botAgentEmail": process.env?.BOT_AGENT_EMAIL,
    "listToImport": process.env?.IMPORT_DATA_IDS?.split(","),
    "updateSkipTimingInMinutes": process.env?.UPDATE_SKIP_TIMING
});

export const env = {
    ...envConfiguration,
    "isDevEnvironnement": envConfiguration.isDevEnvironnement ?? false
};
