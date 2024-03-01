import type { ReturnType } from "tsafe";
import { TRPCError } from "@trpc/server";
import { assert } from "tsafe/assert";
import { z } from "zod";
import * as fs from "fs";
import { join as pathJoin } from "path";
import { getProjectRoot } from "../tools/getProjectRoot";
import fetch from "node-fetch";
import type { Core, Context as CoreContext } from "../core";
import type { Context } from "./context";
import type { User } from "./user";
import type { KeycloakParams } from "../tools/createValidateKeycloakSignature";
import memoize from "memoizee";
import type {
    SoftwareType,
    Os,
    SoftwareFormData,
    DeclarationFormData,
    InstanceFormData
} from "../core/usecases/readWriteSillData";
import type { Equals } from "tsafe";
import type { OptionalIfCanBeUndefined } from "../tools/OptionalIfCanBeUndefined";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { type LocalizedString, Language, languages, ExternalDataOrigin } from "../core/ports/GetSoftwareExternalData";
import { createResolveLocalizedString } from "i18nifty/LocalizedString/reactless";

export function createRouter(params: {
    core: Core;
    coreContext: CoreContext;
    keycloakParams:
        | (KeycloakParams & {
              organizationUserProfileAttributeName: string;
          })
        | undefined;
    jwtClaimByUserKey: Record<keyof User, string>;
    termsOfServiceUrl: LocalizedString;
    readmeUrl: LocalizedString;
    redirectUrl: string | undefined;
    externalSoftwareDataOrigin: ExternalDataOrigin;
}) {
    const {
        core,
        coreContext,
        keycloakParams,
        jwtClaimByUserKey,
        termsOfServiceUrl,
        readmeUrl,
        redirectUrl,
        externalSoftwareDataOrigin
    } = params;

    const t = initTRPC.context<Context>().create({
        "transformer": superjson
    });

    const loggedProcedure = t.procedure.use(
        t.middleware(async opts => {
            const start = Date.now();

            const result = await opts.next();

            const durationMs = Date.now() - start;
            const meta = { "path": opts.path, "type": opts.type, durationMs };

            result.ok ? console.log("OK request timing:", meta) : console.error("Non-OK request timing", meta);

            return result;
        })
    );

    const router = t.router({
        "getRedirectUrl": loggedProcedure.query(() => redirectUrl),
        "getExternalSoftwareDataOrigin": loggedProcedure.query(() => externalSoftwareDataOrigin),
        "getApiVersion": loggedProcedure.query(
            (() => {
                const out: string = JSON.parse(
                    fs.readFileSync(pathJoin(getProjectRoot(), "package.json")).toString("utf8")
                )["version"];

                return () => out;
            })()
        ),
        "getOidcParams": loggedProcedure.query(
            (() => {
                const out = {
                    "keycloakParams": (() => {
                        if (keycloakParams === undefined) {
                            return undefined;
                        }

                        const { url, realm, clientId } = keycloakParams;

                        return { url, realm, clientId };
                    })(),
                    jwtClaimByUserKey
                };

                return () => out;
            })()
        ),
        "getOrganizationUserProfileAttributeName": loggedProcedure.query(
            (() => {
                const { organizationUserProfileAttributeName } = keycloakParams ?? {};
                if (organizationUserProfileAttributeName === undefined) {
                    return () => {
                        throw new TRPCError({ "code": "METHOD_NOT_SUPPORTED" });
                    };
                }
                return () => organizationUserProfileAttributeName;
            })()
        ),
        "getSoftwares": loggedProcedure.query(() => core.states.readWriteSillData.getSoftwares()),
        "getInstances": loggedProcedure.query(() => core.states.readWriteSillData.getInstances()),
        "getExternalSoftwareOptions": loggedProcedure
            .input(
                z.object({
                    "queryString": z.string(),
                    "language": zLanguage
                })
            )
            .query(({ ctx: { user }, input }) => {
                if (user === undefined) {
                    //To prevent abuse.
                    throw new TRPCError({ "code": "UNAUTHORIZED" });
                }

                const { queryString, language } = input;

                return core.functions.suggestionAndAutoFill.getSoftwareExternalDataOptionsWithPresenceInSill({
                    queryString,
                    language
                });
            }),
        "getSoftwareFormAutoFillDataFromExternalSoftwareAndOtherSources": loggedProcedure
            .input(
                z.object({
                    "externalId": z.string()
                })
            )
            .query(async ({ ctx: { user }, input }) => {
                if (user === undefined) {
                    //To prevent abuse.
                    throw new TRPCError({ "code": "UNAUTHORIZED" });
                }

                const { externalId } = input;

                return core.functions.suggestionAndAutoFill.getSoftwareFormAutoFillDataFromExternalAndOtherSources({
                    externalId
                });
            }),
        "createSoftware": loggedProcedure
            .input(
                z.object({
                    "formData": zSoftwareFormData
                })
            )
            .mutation(async ({ ctx: { user }, input }) => {
                if (user === undefined) {
                    throw new TRPCError({ "code": "UNAUTHORIZED" });
                }

                const { formData } = input;

                try {
                    await core.functions.readWriteSillData.createSoftware({
                        formData,
                        "agent": {
                            "email": user.email,
                            "organization": user.organization
                        }
                    });
                } catch (e) {
                    throw new TRPCError({ "code": "INTERNAL_SERVER_ERROR", "message": String(e) });
                }
            }),
        "updateSoftware": loggedProcedure
            .input(
                z.object({
                    "softwareSillId": z.number(),
                    "formData": zSoftwareFormData
                })
            )
            .mutation(async ({ ctx: { user }, input }) => {
                if (user === undefined) {
                    throw new TRPCError({ "code": "UNAUTHORIZED" });
                }

                const { softwareSillId, formData } = input;

                await core.functions.readWriteSillData.updateSoftware({
                    softwareSillId,
                    formData,
                    "agent": {
                        "email": user.email,
                        "organization": user.organization
                    }
                });
            }),
        "createUserOrReferent": loggedProcedure
            .input(
                z.object({
                    "formData": zDeclarationFormData,
                    "softwareName": z.string()
                })
            )
            .mutation(async ({ ctx: { user }, input }) => {
                if (user === undefined) {
                    throw new TRPCError({ "code": "UNAUTHORIZED" });
                }

                const { formData, softwareName } = input;

                await core.functions.readWriteSillData.createUserOrReferent({
                    formData,
                    softwareName,
                    "agent": {
                        "email": user.email,
                        "organization": user.organization
                    }
                });
            }),

        "removeUserOrReferent": loggedProcedure
            .input(
                z.object({
                    "softwareName": z.string(),
                    "declarationType": z.enum(["user", "referent"])
                })
            )
            .mutation(async ({ ctx: { user }, input }) => {
                if (user === undefined) {
                    throw new TRPCError({ "code": "UNAUTHORIZED" });
                }

                const { softwareName, declarationType } = input;

                await core.functions.readWriteSillData.removeUserOrReferent({
                    softwareName,
                    "agentEmail": user.email,
                    declarationType
                });
            }),

        "createInstance": loggedProcedure
            .input(
                z.object({
                    "formData": zInstanceFormData
                })
            )
            .mutation(async ({ ctx: { user }, input }) => {
                if (user === undefined) {
                    throw new TRPCError({ "code": "UNAUTHORIZED" });
                }

                const { formData } = input;

                const { instanceId } = await core.functions.readWriteSillData.createInstance({
                    formData,
                    "agent": {
                        "email": user.email,
                        "organization": user.organization
                    }
                });

                return { instanceId };
            }),
        "updateInstance": loggedProcedure
            .input(
                z.object({
                    "instanceId": z.number(),
                    "formData": zInstanceFormData
                })
            )
            .mutation(async ({ ctx: { user }, input }) => {
                if (user === undefined) {
                    throw new TRPCError({ "code": "UNAUTHORIZED" });
                }

                const { instanceId, formData } = input;

                await core.functions.readWriteSillData.updateInstance({
                    instanceId,
                    formData,
                    "agentEmail": user.email
                });
            }),
        "getAgents": loggedProcedure.query(async ({ ctx: { user } }) => {
            if (user === undefined) {
                throw new TRPCError({ "code": "UNAUTHORIZED" });
            }

            const agents = core.states.readWriteSillData.getAgents();

            return { agents };
        }),
        "updateIsAgentProfilePublic": loggedProcedure
            .input(
                z.object({
                    "isPublic": z.boolean()
                })
            )
            .mutation(async ({ ctx: { user }, input }) => {
                if (user === undefined) {
                    throw new TRPCError({ "code": "UNAUTHORIZED" });
                }

                const { isPublic } = input;

                await core.functions.readWriteSillData.updateIsAgentProfilePublic({
                    "agent": {
                        "email": user.email,
                        "organization": user.organization
                    },
                    isPublic
                });
            }),
        "updateAgentAbout": loggedProcedure
            .input(
                z.object({
                    "about": z.string().optional()
                })
            )
            .mutation(async ({ ctx: { user }, input }) => {
                if (user === undefined) {
                    throw new TRPCError({ "code": "UNAUTHORIZED" });
                }

                const { about } = input;

                await core.functions.readWriteSillData.updateAgentAbout({
                    "agent": {
                        "email": user.email,
                        "organization": user.organization
                    },
                    about
                });
            }),
        "getIsAgentProfilePublic": loggedProcedure
            .input(
                z.object({
                    "email": z.string()
                })
            )
            .query(async ({ input }) => {
                const { email } = input;

                const isPublic = core.functions.readWriteSillData.getAgentIsPublic({
                    email
                });

                return { isPublic };
            }),
        "getAgent": loggedProcedure
            .input(
                z.object({
                    "email": z.string()
                })
            )
            .query(async ({ ctx: { user }, input }) => {
                const { email } = input;

                const isPublic = core.functions.readWriteSillData.getAgentIsPublic({
                    email
                });

                if (!isPublic && user === undefined) {
                    throw new TRPCError({ "code": "UNAUTHORIZED" });
                }

                const agent = await core.functions.readWriteSillData.getAgent({
                    email
                });

                return { agent };
            }),
        "getAllowedEmailRegexp": loggedProcedure.query(coreContext.userApi.getAllowedEmailRegexp),
        "getAllOrganizations": loggedProcedure.query(coreContext.userApi.getAllOrganizations),
        "changeAgentOrganization": loggedProcedure
            .input(
                z.object({
                    "newOrganization": z.string()
                })
            )
            .mutation(async ({ ctx: { user }, input }) => {
                if (user === undefined) {
                    throw new TRPCError({ "code": "UNAUTHORIZED" });
                }

                assert(keycloakParams !== undefined);

                const { newOrganization } = input;

                await core.functions.readWriteSillData.changeAgentOrganization({
                    "email": user.email,
                    newOrganization,
                    "userId": user.id
                });
            }),
        "updateEmail": loggedProcedure
            .input(
                z.object({
                    "newEmail": z.string().email()
                })
            )
            .mutation(async ({ ctx: { user }, input }) => {
                if (user === undefined) {
                    throw new TRPCError({ "code": "UNAUTHORIZED" });
                }

                const { newEmail } = input;

                assert(keycloakParams !== undefined);

                await core.functions.readWriteSillData.updateUserEmail({
                    "userId": user.id,
                    "email": user.email,
                    newEmail
                });
            }),
        "getRegisteredUserCount": loggedProcedure.query(async () => coreContext.userApi.getUserCount()),
        "getTotalReferentCount": loggedProcedure.query(() => {
            const referentCount = core.states.readWriteSillData.getReferentCount();
            return { referentCount };
        }),
        "getTermsOfServiceUrl": loggedProcedure.query(() => termsOfServiceUrl),
        "getMarkdown": loggedProcedure
            .input(
                z.object({
                    "language": zLanguage,
                    "name": z.union([z.literal("readme"), z.literal("termsOfService")])
                })
            )
            .query(
                (() => {
                    const maxAge = (1000 * 3600) / 2;

                    const memoizedFetch = memoize(async (url: string) => fetch(url).then(res => res.text()), {
                        "promise": true,
                        maxAge,
                        "preFetch": true
                    });

                    // prettier-ignore
                    languages
                        .map(lang => createResolveLocalizedString({ "currentLanguage": lang, "fallbackLanguage": "en" }))
                        .map(({ resolveLocalizedString }) => [termsOfServiceUrl, readmeUrl].map(resolveLocalizedString))
                        .flat()
                        .forEach(async function callee(url) {

                            memoizedFetch(url);

                            await new Promise(resolve => setTimeout(resolve, maxAge - 10_000));

                            callee(url);

                        });

                    return async ({ input }) => {
                        const { language, name } = input;

                        const { resolveLocalizedString } = createResolveLocalizedString({
                            "currentLanguage": language,
                            "fallbackLanguage": "en"
                        });

                        return memoizedFetch(
                            resolveLocalizedString(
                                (() => {
                                    switch (name) {
                                        case "readme":
                                            return readmeUrl;
                                        case "termsOfService":
                                            return termsOfServiceUrl;
                                    }
                                })()
                            )
                        );
                    };
                })()
            ),
        "unreferenceSoftware": loggedProcedure
            .input(
                z.object({
                    "softwareName": z.string(),
                    "reason": z.string()
                })
            )
            .mutation(async ({ ctx: { user }, input }) => {
                if (user === undefined) {
                    throw new TRPCError({ "code": "UNAUTHORIZED" });
                }

                const { softwareName, reason } = input;

                await core.functions.readWriteSillData.unreferenceSoftware({
                    softwareName,
                    reason
                });
            })
    });

    return { router };
}

export type TrpcRouter = ReturnType<typeof createRouter>["router"];

const zSoftwareType = z.union([
    z.object({
        "type": z.literal("desktop/mobile"),
        "os": z.object({
            "windows": z.boolean(),
            "linux": z.boolean(),
            "mac": z.boolean(),
            "android": z.boolean(),
            "ios": z.boolean()
        })
    }),
    z.object({
        "type": z.literal("cloud")
    }),
    z.object({
        "type": z.literal("stack")
    })
]);

{
    type Got = ReturnType<(typeof zSoftwareType)["parse"]>;
    type Expected = SoftwareType;

    assert<Equals<Got, Expected>>();
}

const zOs = z.enum(["windows", "linux", "mac", "android", "ios"]);

{
    type Got = ReturnType<(typeof zOs)["parse"]>;
    type Expected = Os;

    assert<Equals<Got, Expected>>();
}

const zSoftwareFormData = (() => {
    const zOut = z.object({
        "softwareType": zSoftwareType,
        "externalId": z.string().optional(),
        "comptoirDuLibreId": z.number().optional(),
        "softwareName": z.string(),
        "softwareDescription": z.string(),
        "softwareLicense": z.string(),
        "softwareMinimalVersion": z.string(),
        "isPresentInSupportContract": z.boolean(),
        "isFromFrenchPublicService": z.boolean(),
        "similarSoftwareExternalDataIds": z.array(z.string()),
        "softwareLogoUrl": z.string().optional(),
        "softwareKeywords": z.array(z.string()),
        "doRespectRgaa": z.boolean().or(z.null())
    });

    {
        type Got = ReturnType<(typeof zOut)["parse"]>;
        type Expected = OptionalIfCanBeUndefined<SoftwareFormData>;

        assert<Equals<Got, Expected>>();
    }

    return zOut as z.ZodType<SoftwareFormData>;
})();

const zDeclarationFormData = (() => {
    const zUser = z.object({
        "declarationType": z.literal("user"),
        "usecaseDescription": z.string(),
        "os": zOs.optional(),
        "version": z.string(),
        "serviceUrl": z.string().optional()
    });

    {
        type Got = ReturnType<(typeof zUser)["parse"]>;
        type Expected = OptionalIfCanBeUndefined<DeclarationFormData.User>;

        assert<Equals<Got, Expected>>();
    }

    const zReferent = z.object({
        "declarationType": z.literal("referent"),
        "isTechnicalExpert": z.boolean(),
        "usecaseDescription": z.string(),
        "serviceUrl": z.string().optional()
    });

    {
        type Got = ReturnType<(typeof zReferent)["parse"]>;
        type Expected = OptionalIfCanBeUndefined<DeclarationFormData.Referent>;

        assert<Equals<Got, Expected>>();
    }

    return z.union([zUser, zReferent]) as z.ZodType<DeclarationFormData>;
})();

const zInstanceFormData = (() => {
    const zOut = z.object({
        "mainSoftwareSillId": z.number(),
        "organization": z.string(),
        "targetAudience": z.string(),
        "publicUrl": z.string().optional(),
        "otherSoftwareWikidataIds": z.array(z.string())
    });

    {
        type Got = ReturnType<(typeof zOut)["parse"]>;
        type Expected = OptionalIfCanBeUndefined<InstanceFormData>;

        assert<Equals<Got, Expected>>();
    }

    return zOut as z.ZodType<InstanceFormData>;
})();

const zLanguage = z.union([z.literal("fr"), z.literal("en")]);

{
    type Got = ReturnType<(typeof zLanguage)["parse"]>;
    type Expected = Language;

    assert<Equals<Got, Expected>>();
}
