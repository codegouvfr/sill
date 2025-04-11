import { memo, forwardRef } from "react";
import { assert } from "tsafe/assert";
import type { Equals } from "tsafe";
import { Trans, useTranslation } from "react-i18next";
import { Header as HeaderDsfr, HeaderProps } from "@codegouvfr/react-dsfr/Header";
import { routes } from "ui/routes";
import { LanguageSelect } from "./LanguageSelect";
import { AuthButtons } from "./AuthButtons";
import config from "../../config-ui.json";

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

        const { t } = useTranslation();

        /*
        const { classes, cx } = useStyles({
            "isOnPageMyAccount": routeName === "account"
        });
        */
        const navigations = [];
        if (config.header.menu.welcome.enabled) {
            navigations.push({
                isActive: routeName === routes.home.name,
                linkProps: routes.home().link,
                text: t("header.navigation welcome")
            });
        }
        if (config.header.menu.catalog.enabled) {
            navigations.push({
                isActive:
                    routeName === routes.softwareCatalog.name ||
                    routeName === routes.softwareDetails.name ||
                    routeName === routes.softwareUsersAndReferents.name,
                linkProps: routes.softwareCatalog().link,
                text: t("header.navigation catalog")
            });
        }
        if (config.header.menu.addSoftware.enabled) {
            navigations.push({
                isActive:
                    routeName === routes.addSoftwareLanding.name ||
                    routeName === routes.softwareUpdateForm.name ||
                    routeName === routes.softwareCreationForm.name,
                linkProps: routes.addSoftwareLanding().link,
                text:
                    routeName === routes.softwareUpdateForm.name
                        ? t("header.navigation update software")
                        : t("header.navigation add software")
            });
        }
        if (config.header.menu.about.enabled) {
            navigations.push({
                isActive: routeName === routes.readme.name,
                linkProps: routes.readme().link,
                text: t("header.navigation about")
            });
        }
        if (config.header.menu.contribute.enabled) {
            navigations.push({
                linkProps: {
                    target: "_blank",
                    href: config.header.menu.contribute.href
                },
                text: t("header.navigation support request")
            });
        }

        const link: HeaderProps.QuickAccessItem | null = config.header.link
            ? {
                  iconId: "fr-icon-bank-fill",
                  linkProps: config.header.link.linkProps,
                  text: config.header.link.text
              }
            : null;

        const quickAccess: Array<JSX.Element | HeaderProps.QuickAccessItem> = [
            <LanguageSelect />,
            ...(link ? [link] : []),
            <AuthButtons
                isOnPageMyAccount={routeName === "account"}
                userAuthenticationApi={userAuthenticationApi}
            />
        ];

        return (
            <HeaderDsfr
                ref={ref}
                className={className}
                brandTop={<Trans i18nKey={"header.siteTitle"} />}
                serviceTitle={t("header.title")}
                homeLinkProps={{
                    ...routes.home().link,
                    title: t("header.home title")
                }}
                quickAccessItems={quickAccess}
                navigation={navigations}
            />
        );
    })
);
