import { Suspense } from "react";
import { tss, useStyles as useCss } from "tss-react/dsfr";
import { useRoute } from "ui/routes";
import { Header } from "ui/shared/Header";
import { Footer } from "ui/shared/Footer";
import { declareComponentKeys } from "i18nifty";
import { useCore } from "core";
import { RouteProvider } from "ui/routes";
import { injectGlobalStatesInSearchParams } from "powerhooks/useGlobalState";
import { evtLang } from "ui/i18n";
import {
    addSillApiUrlToQueryParams,
    addTermsOfServiceUrlToQueryParams,
    addIsDarkToQueryParams,
    addAppLocationOriginToQueryParams
} from "keycloak-theme/login/valuesTransferredOverUrl";
import { createCoreProvider } from "core";
import { pages } from "ui/pages";
import { useConst } from "powerhooks/useConst";
import { objectKeys } from "tsafe/objectKeys";
import { useLang } from "ui/i18n";
import { assert } from "tsafe/assert";
import { useIsDark } from "@codegouvfr/react-dsfr/useIsDark";
import { keyframes } from "tss-react";
import { LoadingFallback, loadingFallbackClassName } from "ui/shared/LoadingFallback";
import { useDomRect } from "powerhooks/useDomRect";
import { apiUrl, appUrl, appPath } from "urls";

let keycloakIsDark: boolean;

const { CoreProvider } = createCoreProvider({
    apiUrl,
    appUrl,
    // prettier-ignore
    "transformUrlBeforeRedirectToLogin": ({ url, termsOfServiceUrl }) =>
        [url]
            .map(injectGlobalStatesInSearchParams)
            .map(url => addSillApiUrlToQueryParams({ url, "value": apiUrl }))
            .map(url => addIsDarkToQueryParams({ url, "value": keycloakIsDark }))
            .map(url => addTermsOfServiceUrlToQueryParams({ url, "value": termsOfServiceUrl }))
            .map(url => addAppLocationOriginToQueryParams({ url, "value": window.location.origin }))
        [0],
    "getCurrentLang": () => evtLang.state,
    "onMoved": ({ redirectUrl }) => {
        const currentUrlObj = new URL(window.location.href);

        const newPathname = currentUrlObj.pathname.replace(appPath, "");

        const targetUrlObj = new URL(redirectUrl);

        const newUrl = new URL(
            targetUrlObj.pathname +
                newPathname +
                currentUrlObj.search +
                currentUrlObj.hash,
            targetUrlObj.origin
        );

        window.location.href = newUrl.toString();
    }
});

export default function App() {
    const { css } = useCss();

    return (
        <CoreProvider
            fallback={<LoadingFallback className={css({ "height": "100vh" })} />}
        >
            <RouteProvider>
                <ContextualizedApp />
            </RouteProvider>
        </CoreProvider>
    );
}

function ContextualizedApp() {
    keycloakIsDark = useIsDark().isDark;

    const route = useRoute();

    const { userAuthentication, sillApiVersion } = useCore().functions;

    const headerUserAuthenticationApi = useConst(() =>
        userAuthentication.getIsUserLoggedIn()
            ? {
                  "isUserLoggedIn": true as const,
                  "logout": () => userAuthentication.logout({ "redirectTo": "home" })
              }
            : {
                  "isUserLoggedIn": false as const,
                  "login": () =>
                      userAuthentication.login({ "doesCurrentHrefRequiresAuth": false })
              }
    );

    const {
        ref: headerRef,
        domRect: { height: headerHeight }
    } = useDomRect();

    const { classes } = useStyles({ headerHeight });

    const i18nApi = useLang();

    return (
        <div className={classes.root}>
            <Header
                ref={headerRef}
                routeName={route.name}
                userAuthenticationApi={headerUserAuthenticationApi}
                i18nApi={i18nApi}
            />
            <main className={classes.main}>
                <Suspense fallback={<LoadingFallback />}>
                    {(() => {
                        for (const pageName of objectKeys(pages)) {
                            //You must be able to replace "home" by any other page and get no type error.
                            const page = pages[pageName as "home"];

                            if (page.routeGroup.has(route)) {
                                if (
                                    page.getDoRequireUserLoggedIn(route) &&
                                    !userAuthentication.getIsUserLoggedIn()
                                ) {
                                    userAuthentication.login({
                                        "doesCurrentHrefRequiresAuth": true
                                    });
                                    return <LoadingFallback />;
                                }

                                return (
                                    <page.LazyComponent
                                        route={route}
                                        className={classes.page}
                                    />
                                );
                            }
                        }

                        return <pages.page404.LazyComponent className={classes.page} />;
                    })()}
                </Suspense>
            </main>
            <Footer
                webVersion={(() => {
                    const webVersion = process.env.VERSION;
                    assert(webVersion !== undefined);
                    return webVersion;
                })()}
                apiVersion={sillApiVersion.getSillApiVersion()}
            />
        </div>
    );
}

const useStyles = tss
    .withName({ App })
    .withParams<{ headerHeight: number }>()
    .create(({ headerHeight }) => ({
        "root": {
            "height": "100vh",
            "display": "flex",
            "flexDirection": "column"
        },
        "main": {
            "flex": 1,
            [`& .${loadingFallbackClassName}`]: {
                "height": `calc(100vh - ${headerHeight}px)`
            }
        },
        "page": {
            "animation": `${keyframes`
            0% {
                opacity: 0;
            }
            100% {
                opacity: 1;
            }
            `} 400ms`
        }
    }));

/**
 * "App" key is used for common translation keys
 */
export const { i18n } = declareComponentKeys<
    | "yes"
    | "no"
    | "previous"
    | "next"
    | "add software"
    | "update software"
    | "add software or service"
    | "add instance"
    | "update instance"
    | "required"
    | "invalid url"
    | "invalid version"
    | "all"
    | "allFeminine"
    | "loading"
    | "no result"
    | "search"
    | "validate"
    | "not provided"
>()("App");
