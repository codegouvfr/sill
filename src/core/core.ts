import { createCoreFromUsecases } from "redux-clean-architecture";
import type { GenericCreateEvt, GenericThunks } from "redux-clean-architecture";
import { usecases } from "./usecases";
import type { ReturnType } from "tsafe/ReturnType";
import type { LocalizedString } from "i18nifty";
import type { Language } from "@codegouvfr/sill";
import type { Oidc } from "./ports/Oidc";
import { createObjectThatThrowsIfAccessed } from "redux-clean-architecture";
import { createGetUser } from "core/adapter/getUser";
import type { GetUser } from "core/ports/GetUser";

export async function createCore(params: {
    /** Empty string for using mock */
    apiUrl: string;
    appUrl: string;
    /** Default: false, only considered if using mocks */
    isUserInitiallyLoggedIn?: boolean;
    transformUrlBeforeRedirectToLogin: (params: {
        url: string;
        termsOfServiceUrl: LocalizedString<Language>;
    }) => string;
    getCurrentLang: () => Language;
}) {
    const {
        apiUrl,
        appUrl,
        isUserInitiallyLoggedIn = false,
        transformUrlBeforeRedirectToLogin,
        getCurrentLang
    } = params;

    let oidc: Oidc | undefined = undefined;

    const sillApi = await (async () => {
        if (apiUrl === "") {
            const { sillApi } = await import("core/adapter/sillApiMock");

            return sillApi;
        }

        const { createSillApi } = await import("core/adapter/sillApi");

        const sillApi = createSillApi({
            "url": apiUrl,
            "getOidcAccessToken": () => {
                if (oidc === undefined || !oidc.isUserLoggedIn) {
                    return undefined;
                }
                return oidc.getAccessToken();
            }
        });

        return sillApi;
    })();

    const [{ keycloakParams, jwtClaimByUserKey }, termsOfServiceUrl] = await Promise.all([
        sillApi.getOidcParams(),
        sillApi.getTermsOfServiceUrl()
    ]);

    oidc = await (async () => {
        if (keycloakParams === undefined) {
            const { createOidc } = await import("core/adapter/oidcMock");

            return createOidc({
                isUserInitiallyLoggedIn,
                jwtClaimByUserKey,
                "user": {
                    "organization": "DINUM",
                    "email": "joseph.garrone@code.gouv.fr",
                    "id": "xxxxx"
                }
            });
        }

        const { createOidc } = await import("core/adapter/oidc");

        return createOidc({
            ...keycloakParams,
            appUrl,
            "transformUrlBeforeRedirect": url =>
                transformUrlBeforeRedirectToLogin({
                    url,
                    termsOfServiceUrl
                }),
            "getUiLocales": getCurrentLang
        });
    })();

    const getUser = (() => {
        if (!oidc.isUserLoggedIn) {
            return createObjectThatThrowsIfAccessed<GetUser>();
        }

        const { getUser } = createGetUser({
            jwtClaimByUserKey,
            "getOidcAccessToken": oidc.getAccessToken
        });

        return getUser;
    })();

    const core = createCoreFromUsecases({
        usecases,
        "thunksExtraArgument": {
            "coreParams": params,
            sillApi,
            oidc,
            getUser
        }
    });

    await Promise.all([
        core.dispatch(usecases.sillApiVersion.privateThunks.initialize()),
        core.dispatch(usecases.softwareCatalog.privateThunks.initialize()),
        core.dispatch(usecases.generalStats.privateThunks.initialize()),
        core.dispatch(usecases.redirect.privateThunks.initialize())
    ]);

    return core;
}

type Core = ReturnType<typeof createCore>;

export type State = ReturnType<Core["getState"]>;

export type Thunks = GenericThunks<Core>;

export type CreateEvt = GenericCreateEvt<Core>;
