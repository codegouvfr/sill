// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import * as trpcExpress from "@trpc/server/adapters/express";
import compression from "compression";
import cors from "cors";
import express, { Handler } from "express";
import { Kysely } from "kysely";
import { basename as pathBasename } from "path";
import type { Equals } from "tsafe";
import { assert } from "tsafe/assert";
import { bootstrapCore } from "../core";
import { Database } from "../core/adapters/dbApi/kysely/kysely.database";
import { createPgDialect } from "../core/adapters/dbApi/kysely/kysely.dialect";
import { compiledDataPrivateToPublic } from "../core/ports/CompileData";
import { DbApiV2 } from "../core/ports/DbApiV2";
import { Language, languages } from "../core/ports/GetSoftwareExternalData";
import { OidcParams } from "../tools/oidc";
import { createContextFactory } from "./context";
import { createRouter } from "./router";
import { getTranslations } from "./translations/getTranslations";

const makeGetCatalogiJson =
    (redirectUrl: string | undefined, dbApi: DbApiV2): Handler =>
    async (req, res) => {
        if (redirectUrl !== undefined) {
            return res.redirect(redirectUrl + req.originalUrl);
        }

        const privateCompiledData = await dbApi.getCompiledDataPrivate();
        const compiledDataPublicJson = JSON.stringify(compiledDataPrivateToPublic(privateCompiledData));

        res.setHeader("Content-Type", "application/json").send(Buffer.from(compiledDataPublicJson, "utf8"));
    };

export async function startRpcService(params: {
    oidcParams: OidcParams;
    port: number;
    isDevEnvironnement: boolean;
    redirectUrl?: string;
    databaseUrl: string;
}) {
    const { redirectUrl, oidcParams, port, isDevEnvironnement, databaseUrl, ...rest } = params;

    assert<Equals<typeof rest, {}>>();

    console.log({ isDevEnvironnement });

    const kyselyDb = new Kysely<Database>({ dialect: createPgDialect(databaseUrl) });

    const [{ dbApi, useCases, uiConfig }, { createContext }] = await Promise.all([
        bootstrapCore({
            "dbConfig": {
                "dbKind": "kysely",
                "kyselyDb": kyselyDb
            }
        }),
        createContextFactory({
            "oidcParams": {
                "issuerUri": oidcParams.issuerUri
            }
        })
    ]);

    const { router } = createRouter({
        useCases,
        dbApi,
        oidcParams,
        redirectUrl,
        uiConfig
    });

    express()
        .use(cors())
        .use(compression() as any)
        .use((req, _res, next) => (console.log("⬅", req.method, req.path, req.body ?? req.query), next()))
        .use("/public/healthcheck", (...[, res]) => res.sendStatus(200))
        .get("/:lang/translations.json", async (req, res) => {
            const lang = req.params.lang as Language;
            try {
                if (!languages.includes(lang))
                    return res.status(404).json({
                        message: `No translations found for language : ${lang}. Only ${languages.join(", ")} are supported.`
                    });
                const translations = getTranslations(lang);
                return res.json(translations);
            } catch (error: any) {
                return res
                    .status(404)
                    .json({ message: `No translations found for language : ${lang}`, error: error.message });
            }
        })
        .get(`*/catalogi.json`, makeGetCatalogiJson(redirectUrl, dbApi))
        // the following is just for backward compatibility
        .get(`*/sill.json`, makeGetCatalogiJson(redirectUrl, dbApi))
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
