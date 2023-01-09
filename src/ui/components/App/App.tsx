import type { RefObject } from "react";
import { useMemo, useEffect, memo } from "react";
import { Header } from "@codegouvfr/react-dsfr/Header";
import { fr } from "@codegouvfr/react-dsfr";
import { Footer } from "./Footer";
import { useLang, evtLang, useTranslation } from "ui/i18n";
import { makeStyles } from "tss-react/dsfr";
import { useCoreFunctions } from "core";
import { useRoute, routes } from "ui/routes";
import { useDomRect } from "onyxia-ui";
import { Account } from "ui/components/pages/Account";
import { FourOhFour } from "ui/components/pages/FourOhFour";
import { Catalog } from "ui/components/pages/Catalog";
import { Form } from "ui/components/pages/Form";
import { Terms } from "ui/components/pages/Terms";
import { Readme } from "ui/components/pages/Readme";
import { SoftwareCard } from "ui/components/pages/SoftwareCard";
import { ServiceCatalog } from "ui/components/pages/ServiceCatalog";
import { ServiceForm } from "ui/components/pages/ServiceForm";
import { typeGuard } from "tsafe/typeGuard";
import { Language } from "sill-api";
import { id } from "tsafe/id";
import { useConst } from "powerhooks/useConst";
import { useStickyTop } from "powerhooks/useStickyTop";
import { useWindowInnerSize } from "powerhooks/useWindowInnerSize";
import { languages } from "sill-api";
import { declareComponentKeys } from "i18nifty";
import { useEvt } from "evt/hooks";
import { getScrollableParent } from "powerhooks/getScrollableParent";
import { Evt } from "evt";
import { getConfiguration } from "configuration";
import { setPreviousCatalog } from "./useHistory";

export type Props = {
    className?: string;
};

export const App = memo((props: Props) => {
    const { className } = props;

    const route = useRoute();

    useEffect(() => {
        switch (route.name) {
            case "serviceCatalog":
            case "catalog":
                setPreviousCatalog(route.name);
                break;
        }
    }, [route.name]);

    useApplyLanguageSelectedAtLogin();

    const { ref: rootRef } = useDomRect();

    const { classes, cx } = useStyles();

    const { userAuthentication, apiInfo } = useCoreFunctions();

    /*const isUserLoggedIn = userAuthentication.getIsUserLoggedIn();*/

    /*    const onHeaderAuthClick = useConstCallback(() =>
        isUserLoggedIn
            ? userAuthentication.logout({ "redirectTo": "home" })
            : userAuthentication.login({ "doesCurrentHrefRequiresAuth": false }),
    );*/

    const termsLink = useMemo(() => routes.terms().link, []);

    useRestoreScroll({ route, rootRef });

    return (
        <div ref={rootRef} className={cx(classes.root, className)}>
            <Header
                brandTop="SILL"
                homeLinkProps={{
                    href: "/",
                    title: "Accueil - Nom de l’entité (ministère, secrétariat d‘état, gouvernement)",
                }}
                navigation={[
                    {
                        linkProps: {
                            href: "#",
                            target: "_self",
                        },
                        text: "Bienvenue sur le SILL",
                    },
                    {
                        isActive: true,
                        linkProps: {
                            href: "/catalog",
                            target: "_self",
                        },
                        text: "Catalogue",
                    },
                    {
                        linkProps: {
                            href: "/form",
                            target: "_self",
                        },
                        text: "Ajouter un logiciel ou une instance",
                    },
                    {
                        linkProps: {
                            href: "#",
                            target: "_self",
                        },
                        text: "Demande d'accompagnement",
                    },
                    {
                        linkProps: {
                            href: "#",
                            target: "_self",
                        },
                        text: "À propos du site",
                    },
                ]}
                quickAccessItems={[
                    {
                        iconId: "fr-icon-add-circle-line",
                        linkProps: {
                            href: "#",
                        },
                        text: "Créer un espace",
                    },
                    {
                        iconId: "fr-icon-lock-line",
                        linkProps: {
                            href: "#",
                        },
                        text: "Se connecter",
                    },
                    {
                        iconId: "fr-icon-account-line",
                        linkProps: {
                            href: "#",
                        },
                        text: "S’enregistrer",
                    },
                ]}
                serviceTagline="baseline - précisions sur l'organisation"
                serviceTitle="Nom du site / service"
            />

            <section className={classes.betweenHeaderAndFooter}>
                <main className={classes.main}>
                    <PageSelector route={route} />
                </main>
            </section>
            <Footer
                className={classes.footer}
                termsLink={termsLink}
                packageJsonVersion={process.env.VERSION!}
                apiPackageJsonVersion={apiInfo.getApiVersion()}
                sillJsonHref={`${getConfiguration().apiUrl}/sill.json`}
            />
        </div>
    );
});

export const { i18n } = declareComponentKeys<
    "reduce" | "account" | "catalog" | "service catalog"
>()({ App });

const useStyles = makeStyles({
    "name": { App },
})(theme => ({
    "root": {
        "backgroundColor": theme.decisions.background.default.grey.default,
        ...fr.spacing("padding", {
            "rightLeft": "4v",
        }),
        "position": "relative",
        "display": "flex",
        "minHeight": "100vh",
        "flexDirection": "column",
    },
    "betweenHeaderAndFooter": {
        "display": "flex",
        "alignItems": "start",
    },
    "footer": {
        "marginTop": "auto",
    },
    "main": {
        "& > *": {
            "marginLeft": fr.spacing("4v"),
        },
        "flex": 1,
    },
}));

const PageSelector = memo((props: { route: ReturnType<typeof useRoute> }) => {
    const { route } = props;

    const { userAuthentication } = useCoreFunctions();

    const isUserLoggedIn = userAuthentication.getIsUserLoggedIn();

    useEffect(() => {
        switch (route.name) {
            case "home":
                routes.catalog().replace();
                break;
            case "legacyRoute":
                {
                    {
                        const { lang } = route.params;

                        if (
                            typeGuard<Language>(
                                lang,
                                id<readonly string[]>(languages).includes(lang),
                            )
                        ) {
                            evtLang.state = lang;
                        }
                    }
                    const { id: softwareId } = route.params;

                    (softwareId === undefined
                        ? routes.catalog()
                        : routes.card({ "name": `${softwareId}` })
                    ).replace();
                }
                break;
        }
    }, [route.name]);

    /*
    Here is one of the few places in the codebase where we tolerate code duplication.
    We sacrifice dryness for the sake of type safety and flexibility.
    */
    {
        const Page = Catalog;

        if (Page.routeGroup.has(route)) {
            if (Page.getDoRequireUserLoggedIn() && !isUserLoggedIn) {
                userAuthentication.login({ "doesCurrentHrefRequiresAuth": true });
                return null;
            }

            return <Page route={route} />;
        }
    }

    {
        const Page = Account;

        if (Page.routeGroup.has(route)) {
            if (Page.getDoRequireUserLoggedIn() && !isUserLoggedIn) {
                userAuthentication.login({ "doesCurrentHrefRequiresAuth": true });
                return null;
            }

            return <Page route={route} />;
        }
    }

    {
        const Page = SoftwareCard;

        if (Page.routeGroup.has(route)) {
            if (Page.getDoRequireUserLoggedIn() && !isUserLoggedIn) {
                userAuthentication.login({ "doesCurrentHrefRequiresAuth": true });
                return null;
            }

            return <Page route={route} />;
        }
    }

    {
        const Page = Form;

        if (Page.routeGroup.has(route)) {
            if (Page.getDoRequireUserLoggedIn() && !isUserLoggedIn) {
                userAuthentication.login({ "doesCurrentHrefRequiresAuth": true });
                return null;
            }

            return <Page route={route} />;
        }
    }

    {
        const Page = Terms;

        if (Page.routeGroup.has(route)) {
            if (Page.getDoRequireUserLoggedIn() && !isUserLoggedIn) {
                userAuthentication.login({ "doesCurrentHrefRequiresAuth": true });
                return null;
            }

            return <Page route={route} />;
        }
    }

    {
        const Page = Readme;

        if (Page.routeGroup.has(route)) {
            if (Page.getDoRequireUserLoggedIn() && !isUserLoggedIn) {
                userAuthentication.login({ "doesCurrentHrefRequiresAuth": true });
                return null;
            }

            return <Page route={route} />;
        }
    }

    {
        const Page = ServiceCatalog;

        if (Page.routeGroup.has(route)) {
            if (Page.getDoRequireUserLoggedIn() && !isUserLoggedIn) {
                userAuthentication.login({ "doesCurrentHrefRequiresAuth": true });
                return null;
            }

            return <Page route={route} />;
        }
    }

    {
        const Page = ServiceForm;

        if (Page.routeGroup.has(route)) {
            if (Page.getDoRequireUserLoggedIn() && !isUserLoggedIn) {
                userAuthentication.login({ "doesCurrentHrefRequiresAuth": true });
                return null;
            }

            return <Page route={route} />;
        }
    }

    return <FourOhFour />;
});

/** On the login pages hosted by keycloak the user can select
 * a language, we want to use this language on the app.
 * For example we want that if a user selects english on the
 * register page while signing in that the app be set to english
 * automatically.
 */
function useApplyLanguageSelectedAtLogin() {
    const { userAuthentication } = useCoreFunctions();

    const isUserLoggedIn = userAuthentication.getIsUserLoggedIn();

    const { setLang } = useLang();

    useEffect(() => {
        if (!isUserLoggedIn) {
            return;
        }

        const { locale } = userAuthentication.getImmutableUserFields();

        if (
            !typeGuard<Language>(
                locale,
                locale !== undefined &&
                    locale in
                        id<Record<Language, null>>({
                            "en": null,
                            "fr": null,
                        }),
            )
        ) {
            return;
        }

        setLang(locale);
    }, []);
}

function useRestoreScroll(params: {
    route: ReturnType<typeof useRoute>;
    rootRef: RefObject<HTMLDivElement>;
}) {
    const { route, rootRef } = params;

    const scrollTopByPageName = useConst((): Record<string, number> => ({}));

    useEvt(
        ctx => {
            const element = rootRef.current;

            if (element === null) {
                return;
            }

            if (route.name === false) {
                return;
            }

            const scrollableElement = getScrollableParent({
                "doReturnElementIfScrollable": true,
                element,
            });

            {
                const scrollTop = scrollTopByPageName[route.name] ?? 0;

                (async function callee(count: number) {
                    if (count === 0) {
                        return;
                    }

                    if (scrollableElement.scrollHeight < scrollTop) {
                        await new Promise(resolve => setTimeout(resolve, 150));
                        callee(count - 1);
                        return;
                    }

                    scrollableElement.scrollTo(0, scrollTop);
                })(4);
            }

            Evt.from(ctx, scrollableElement, "scroll").attach(
                () => (scrollTopByPageName[route.name] = scrollableElement.scrollTop),
            );
        },
        [rootRef.current, route.name],
    );
}
