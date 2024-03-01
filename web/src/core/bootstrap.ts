import { usecases } from "./usecases";
import type { LocalizedString } from "i18nifty";
import type { Language } from "@codegouvfr/sill";
import type { Oidc } from "./ports/Oidc";
import {
    createCore,
    type GenericCore,
    createObjectThatThrowsIfAccessed
} from "redux-clean-architecture";
import { createGetUser } from "core/adapter/getUser";
import type { GetUser } from "core/ports/GetUser";
import type { SillApi } from "core/ports/SillApi";

type ParamsOfBootstrapCore = {
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
    onMoved: (params: { redirectUrl: string }) => void;
};

type Context = {
    paramsOfBootstrapCore: ParamsOfBootstrapCore;
    sillApi: SillApi;
    oidc: Oidc;
    getUser: GetUser;
};

type Core = GenericCore<typeof usecases, Context>;

export type State = Core["types"]["State"];
export type Thunks = Core["types"]["Thunks"];
export type CreateEvt = Core["types"]["CreateEvt"];

export async function bootstrapCore(
    params: ParamsOfBootstrapCore
): Promise<{ core: Core }> {
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
                return oidc.getTokens().accessToken;
            }
        });

        return sillApi;
    })();

    const redirectUrl = await sillApi.getRedirectUrl();

    if (redirectUrl !== undefined) {
        params.onMoved({ redirectUrl });

        await new Promise(() => {});
    }

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
            "keycloakUrl": keycloakParams.url,
            "keycloakRealm": keycloakParams.realm,
            "clientId": keycloakParams.clientId,
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

        const oidcLoggedIn = oidc;

        const { getUser } = createGetUser({
            jwtClaimByUserKey,
            "getOidcAccessToken": () => oidcLoggedIn.getTokens().accessToken
        });

        return getUser;
    })();

    const context: Context = {
        "paramsOfBootstrapCore": params,
        sillApi,
        oidc,
        getUser
    };

    const { core, dispatch } = createCore({
        usecases,
        context
    });

    await Promise.all([
        dispatch(usecases.sillApiVersion.protectedThunks.initialize()),
        dispatch(usecases.externalDataOrigin.protectedThunks.initialize()),
        dispatch(usecases.softwareCatalog.protectedThunks.initialize()),
        dispatch(usecases.generalStats.protectedThunks.initialize()),
        dispatch(usecases.redirect.protectedThunks.initialize())
    ]);

    return { core };
}
