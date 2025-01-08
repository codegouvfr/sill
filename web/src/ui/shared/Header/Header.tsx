import { memo, forwardRef } from "react";
import { assert } from "tsafe/assert";
import type { Equals } from "tsafe";
import { useTranslation } from "react-i18next";
import { Header as HeaderDsfr, HeaderProps } from "@codegouvfr/react-dsfr/Header";
import { routes } from "ui/routes";
import { contactEmail } from "ui/shared/contactEmail";
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
                "isActive": routeName === routes.home.name,
                "linkProps": routes.home().link,
                "text": t("header.navigation welcome")
            });
        }
        if (config.header.menu.catalog.enabled) {
            navigations.push({
                "isActive":
                    routeName === routes.softwareCatalog.name ||
                    routeName === routes.softwareDetails.name ||
                    routeName === routes.softwareUsersAndReferents.name,
                "linkProps": routes.softwareCatalog().link,
                "text": t("header.navigation catalog")
            });
        }
        if (config.header.menu.addSoftware.enabled) {
            navigations.push({
                "isActive":
                    routeName === routes.addSoftwareLanding.name ||
                    routeName === routes.softwareUpdateForm.name ||
                    routeName === routes.softwareCreationForm.name,
                "linkProps": routes.addSoftwareLanding().link,
                "text":
                    routeName === routes.softwareUpdateForm.name
                        ? t("header.navigation update software")
                        : t("header.navigation add software")
            });
        }
        if (config.header.menu.about.enabled) {
            navigations.push({
                "isActive": routeName === routes.readme.name,
                "linkProps": routes.readme().link,
                "text": t("header.navigation about")
            });
        }
        if (config.header.menu.catalog.enabled) {
            navigations.push({
                "linkProps": {
                    "target": "_blank",
                    /* cSpell:disable */
                    "href": `mailto:${contactEmail}?subject=${encodeURIComponent(
                        "Demande d'accompagnement"
                    )}`
                    /* cSpell:enable */
                },
                "text": t("header.navigation support request")
            });
        }

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
                serviceTitle={t("header.title")}
                homeLinkProps={{
                    ...routes.home().link,
                    "title": t("header.home title")
                }}
                quickAccessItems={[
                    <LanguageSelect />,
                    config.header.icons[0] as HeaderProps.QuickAccessItem,
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
