import { memo, forwardRef } from "react";
import { assert } from "tsafe/assert";
import type { Equals } from "tsafe";
import { declareComponentKeys } from "i18nifty";
import { useTranslation } from "ui/i18n";
import { Header as HeaderDsfr, HeaderProps } from "@codegouvfr/react-dsfr/Header";
import { routes } from "ui/routes";
import { contactEmail } from "ui/shared/contactEmail";
import { LanguageSelect } from "./LanguageSelect";
import { AuthButtons } from "./AuthButtons";
import configSite from "../../../config-theme-ui.json";

type Props = {
    className?: string;
    routeName: keyof typeof routes | false;
    userAuthenticationApi:
    | {
        isUserLoggedIn: true;
        logout: () => void;
    }
    | {
        isUserLoggedIn: false;
        login: () => Promise<never>;
        register: () => Promise<never>;
    };
};

export const Header = memo(
    forwardRef<HTMLDivElement, Props>((props, ref) => {
        const { className, routeName, userAuthenticationApi, ...rest } = props;

        assert<Equals<typeof rest, {}>>();

        const { t } = useTranslation({ Header });

        /*
        const { classes, cx } = useStyles({
            "isOnPageMyAccount": routeName === "account"
        });
        */

        const navigations = [];
        if (configSite.ui.header.menu.welcome.enabled) {
            navigations.push({
                "isActive": routeName === routes.home.name,
                "linkProps": routes.home().link,
                "text": t("navigation welcome")
            })
        };
        if (configSite.ui.header.menu.catalog.enabled) {
            navigations.push( {
                "isActive":
                    routeName === routes.softwareCatalog.name ||
                        routeName === routes.softwareDetails.name ||
                        routeName === routes.softwareUsersAndReferents.name,
                "linkProps": routes.softwareCatalog().link,
                "text": t("navigation catalog")
            })
        };
        if (configSite.ui.header.menu.addSoftware.enabled) {
            navigations.push( {
                "isActive":
                    routeName === routes.addSoftwareLanding.name ||
                        routeName === routes.softwareUpdateForm.name ||
                        routeName === routes.softwareCreationForm.name,
                "linkProps": routes.addSoftwareLanding().link,
                "text":
                    routeName === routes.softwareUpdateForm.name
                        ? t("navigation update software")
                        : t("navigation add software")
            })
        };
        if (configSite.ui.header.menu.about.enabled) {
            navigations.push( {
                "isActive": routeName === routes.readme.name,
                "linkProps": routes.readme().link,
                "text": t("navigation about")
            })
        };
        if (configSite.ui.header.menu.catalog.enabled) {
            navigations.push( {
                "linkProps": {
                    "target": "_blank",
                    /* cSpell:disable */
                    "href": `mailto:${contactEmail}?subject=${encodeURIComponent(
                        "Demande d'accompagnement"
                    )}`
                    /* cSpell:enable */
                },
                "text": t("navigation support request")
            })
        };

        return (
            <HeaderDsfr
                ref={ref}
                className={className}
                brandTop={
                    // cspell: disable-next-line
                    <>
                        {" "}
                        République <br /> Française{" "}
                    </>
                }
                serviceTitle={t("title")}
                homeLinkProps={{
                    ...routes.home().link,
                    "title": t("home title")
                }}
                quickAccessItems={[
                    <LanguageSelect />,
                    configSite.ui.header.icons[0] as HeaderProps.QuickAccessItem, // TODO Change or delete ?
                    <AuthButtons
                        isOnPageMyAccount={routeName === "account"}
                        userAuthenticationApi={userAuthenticationApi}
                    />
                ]}
                navigation={navigations}
            />
        );
    })
);

export const { i18n } = declareComponentKeys<
    | "home title"
    | "title"
    | "navigation welcome"
    | "navigation catalog"
    | "navigation add software"
    | "navigation update software"
    | "navigation support request"
    | "navigation about"
>()({ Header });
