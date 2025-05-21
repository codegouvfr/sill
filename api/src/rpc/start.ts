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
import { halSourceGateway } from "../core/adapters/hal";
import { wikidataSourceGateway } from "../core/adapters/wikidata";
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

import translationEn from "../customization/translations/en.json";
import translationFr from "../customization/translations/fr.json";

const isAssignable = (fr: typeof translationFr): typeof translationEn => fr;
console.info(isAssignable(translationFr) ? "isAssignable : true" : "isAssignable : false"); // this is just to avoid the TS error : _isAssignable is not used. TODO : use eslint rule instead (no eslint in backend for now)

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

    const [{ dbApi, useCases, uiConfig }, { createContext }] = await Promise.all([
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
        externalSoftwareDataOrigin,
        uiConfig
    });

    express()
        .use(cors())
        .use(compression() as any)
        .use((req, _res, next) => (console.log("⬅", req.method, req.path, req.body ?? req.query), next()))
        .use("/public/healthcheck", (...[, res]) => res.sendStatus(200))
        .get("/:lang/translations.json", async (req, res) => {
            try {
                const translations = await import(`../customization/translations/${req.params.lang}.json`);
                return res.json(translations);
            } catch (error: any) {
                return res
                    .status(404)
                    .json({ message: `No translations found for language : ${req.params.lang}`, error: error.message });
            }
        })
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
                const trpcMiddleware = trpcExpress.createExpressMiddleware({
                    router,
                    createContext
                });

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
                "getSoftwareExternalDataOptions": wikidataSourceGateway.softwareOptions.getById,
                "getSoftwareExternalData": wikidataSourceGateway.softwareExternalData.getById
            };
        case "HAL":
            return {
                "getSoftwareExternalDataOptions": halSourceGateway.softwareOptions.getById,
                "getSoftwareExternalData": halSourceGateway.softwareExternalData.getById
            };
        default:
            const unreachableCase: never = externalSoftwareDataOrigin;
            throw new Error(`Unreachable case: ${unreachableCase}`);
    }
}
