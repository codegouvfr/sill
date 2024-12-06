import { Suspense } from "react";
import { tss, useStyles as useCss } from "tss-react";
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
import { assert } from "tsafe/assert";
import { getIsDark } from "@codegouvfr/react-dsfr/useIsDark";
import { keyframes } from "tss-react";
import { LoadingFallback, loadingFallbackClassName } from "ui/shared/LoadingFallback";
import { useDomRect } from "powerhooks/useDomRect";
import { apiUrl, appUrl, appPath } from "urls";


const { CoreProvider } = createCoreProvider({
    apiUrl,
    appUrl,
    // prettier-ignore
    "transformUrlBeforeRedirectToLogin": ({ url, termsOfServiceUrl }) =>
        [url]
            // TODO: Remove, Not needed in generic keycloak theme
            .map(injectGlobalStatesInSearchParams)
            // TODO: Remove, Not needed in generic keycloak theme
            .map(url => addSillApiUrlToQueryParams({ url, "value": apiUrl }))
            // TODO: Remove, the query param is dark=true or dark=false in generic keycloak theme
            .map(url => addIsDarkToQueryParams({ url, "value": getIsDark() }))
            // TODO: Remove, Not implemented in generic keycloak theme
            .map(url => addTermsOfServiceUrlToQueryParams({ url, "value": termsOfServiceUrl }))
            // TODO: Remove, Not needed in generic keycloak theme, inferred from redirect_uri (redirect to codegouv.fr and not codegouv.fr/sill though)
            .map(url => addAppLocationOriginToQueryParams({ url, "value": window.location.origin }))
            .map(url => {
                const parsedUrl = new URL(url);
                parsedUrl.searchParams.set("dark", `${getIsDark()}`);
                return parsedUrl.toString();
            })
        [0],
    "getCurrentLang": () => evtLang.state,
    // TODO: Remove, this was to redirect to an other instance of the sill
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
                      userAuthentication.login({ "doesCurrentHrefRequiresAuth": false }),
                  "register": () => userAuthentication.register()
              }
    );

    const {
        ref: headerRef,
        domRect: { height: headerHeight }
    } = useDomRect();

    const { classes } = useStyles({ headerHeight });

    return (
        <div className={classes.root}>
            <Header
                ref={headerRef}
                routeName={route.name}
                userAuthenticationApi={headerUserAuthenticationApi}
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
    | "not applicable"
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
