import * as trpcExpress from "@trpc/server/adapters/express";
import compression from "compression";
import cors from "cors";
import express from "express";
import { Kysely } from "kysely";
import { basename as pathBasename } from "path";
import type { Equals } from "tsafe";
import { assert } from "tsafe/assert";
import { bootstrapCore } from "../core";
import { Database } from "../core/adapters/dbApi/kysely/kysely.database";
import { createPgDialect } from "../core/adapters/dbApi/kysely/kysely.dialect";
import { halAdapter } from "../core/adapters/hal";
import { wikidataAdapter } from "../core/adapters/wikidata";
import { compiledDataPrivateToPublic } from "../core/ports/CompileData";
import type {
    ExternalDataOrigin,
    GetSoftwareExternalData,
    LocalizedString
} from "../core/ports/GetSoftwareExternalData";
import type { GetSoftwareExternalDataOptions } from "../core/ports/GetSoftwareExternalDataOptions";
import { OidcParams } from "../tools/oidc";
import { createContextFactory } from "./context";
import { createRouter } from "./router";

export async function startRpcService(params: {
    oidcParams: OidcParams;
    termsOfServiceUrl: LocalizedString;
    githubPersonalAccessTokenForApiRateLimit: string;
    port: number;
    isDevEnvironnement: boolean;
    externalSoftwareDataOrigin: ExternalDataOrigin;
    redirectUrl?: string;
    databaseUrl: string;
    initializeSoftwareFromSource: boolean;
    botAgentEmail?: string;
    listToImport?: string[];
}) {
    const {
        redirectUrl,
        oidcParams,
        termsOfServiceUrl,
        port,
        githubPersonalAccessTokenForApiRateLimit,
        isDevEnvironnement,
        externalSoftwareDataOrigin,
        databaseUrl,
        botAgentEmail,
        initializeSoftwareFromSource,
        listToImport,
        ...rest
    } = params;

    assert<Equals<typeof rest, {}>>();

    console.log({ isDevEnvironnement });

    const kyselyDb = new Kysely<Database>({ dialect: createPgDialect(databaseUrl) });

    const [{ dbApi, useCases }, { createContext }] = await Promise.all([
        bootstrapCore({
            "dbConfig": {
                "dbKind": "kysely",
                "kyselyDb": kyselyDb
            },
            githubPersonalAccessTokenForApiRateLimit,
            // "doPerPerformPeriodicalCompilation": !isDevEnvironnement && redirectUrl === undefined,
            "externalSoftwareDataOrigin": externalSoftwareDataOrigin
        }),
        createContextFactory({
            "oidcParams": {
                "issuerUri": oidcParams.issuerUri
            }
        })
    ]);

    const { getSoftwareExternalDataOptions, getSoftwareExternalData } =
        getSoftwareExternalDataFunctions(externalSoftwareDataOrigin);

    const { router } = createRouter({
        useCases,
        dbApi,
        getSoftwareExternalDataOptions,
        getSoftwareExternalData,
        oidcParams,
        termsOfServiceUrl,
        redirectUrl,
        externalSoftwareDataOrigin
    });

    express()
        .use(cors())
        .use(compression() as any)
        .use((req, _res, next) => (console.log("⬅", req.method, req.path, req.body ?? req.query), next()))
        .use("/public/healthcheck", (...[, res]) => res.sendStatus(200))
        .get(`*/sill.json`, async (req, res) => {
            if (redirectUrl !== undefined) {
                return res.redirect(redirectUrl + req.originalUrl);
            }

            const privateCompiledData = await dbApi.getCompiledDataPrivate();
            const compiledDataPublicJson = JSON.stringify(compiledDataPrivateToPublic(privateCompiledData));

            res.setHeader("Content-Type", "application/json").send(Buffer.from(compiledDataPublicJson, "utf8"));
        })
        .use(
            (() => {
                const trpcMiddleware = trpcExpress.createExpressMiddleware({ router, createContext });

                return (req, res, next) => {
                    const proxyReq = new Proxy(req, {
                        get: (target, prop) => {
                            if (prop === "path") {
                                return `/${pathBasename(target.path)}`;
                            }
                            return Reflect.get(target, prop);
                        }
                    });

                    return trpcMiddleware(proxyReq, res, next);
                };
            })()
        )
        .listen(port, () => console.log(`Listening on port ${port}`));
}

function getSoftwareExternalDataFunctions(externalSoftwareDataOrigin: ExternalDataOrigin): {
    "getSoftwareExternalDataOptions": GetSoftwareExternalDataOptions;
    "getSoftwareExternalData": GetSoftwareExternalData;
} {
    switch (externalSoftwareDataOrigin) {
        case "wikidata":
            return {
                "getSoftwareExternalDataOptions": wikidataAdapter.softwareOptions.getById,
                "getSoftwareExternalData": wikidataAdapter.softwareExternalData.getById
            };
        case "HAL":
            return {
                "getSoftwareExternalDataOptions": halAdapter.softwareOptions.getById,
                "getSoftwareExternalData": halAdapter.softwareExternalData.getById
            };
        default:
            const unreachableCase: never = externalSoftwareDataOrigin;
            throw new Error(`Unreachable case: ${unreachableCase}`);
    }
}
