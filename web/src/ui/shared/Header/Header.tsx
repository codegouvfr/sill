import { memo, forwardRef } from "react";
import { assert } from "tsafe/assert";
import type { Equals } from "tsafe";
import { declareComponentKeys } from "i18nifty";
import { useTranslation } from "react-i18next";
import { Header as HeaderDsfr } from "@codegouvfr/react-dsfr/Header";
import { routes } from "ui/routes";
import { contactEmail } from "ui/shared/contactEmail";
import { LanguageSelect } from "./LanguageSelect";
import { AuthButtons } from "./AuthButtons";

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
                serviceTitle={t("Header.title")}
                homeLinkProps={{
                    ...routes.home().link,
                    "title": t("Header.home title")
                }}
                quickAccessItems={[
                    <LanguageSelect />,
                    {
                        "iconId": "fr-icon-bank-fill",
                        "linkProps": {
                            "href": "https://code.gouv.fr/"
                        },
                        "text": "Code Gouv"
                    },
                    <AuthButtons
                        isOnPageMyAccount={routeName === "account"}
                        userAuthenticationApi={userAuthenticationApi}
                    />
                ]}
                navigation={[
                    {
                        "isActive": routeName === routes.home.name,
                        "linkProps": routes.home().link,
                        "text": t("Header.navigation welcome")
                    },
                    {
                        "isActive":
                            routeName === routes.softwareCatalog.name ||
                            routeName === routes.softwareDetails.name ||
                            routeName === routes.softwareUsersAndReferents.name,
                        "linkProps": routes.softwareCatalog().link,
                        "text": t("Header.navigation catalog")
                    },
                    {
                        "isActive":
                            routeName === routes.addSoftwareLanding.name ||
                            routeName === routes.softwareUpdateForm.name ||
                            routeName === routes.softwareCreationForm.name,
                        "linkProps": routes.addSoftwareLanding().link,
                        "text":
                            routeName === routes.softwareUpdateForm.name
                                ? t("Header.navigation update software")
                                : t("Header.navigation add software")
                    },
                    {
                        "isActive": routeName === routes.readme.name,
                        "linkProps": routes.readme().link,
                        "text": t("Header.navigation about")
                    },
                    {
                        "linkProps": {
                            "target": "_blank",
                            /* cSpell:disable */
                            "href": `mailto:${contactEmail}?subject=${encodeURIComponent(
                                "Demande d'accompagnement"
                            )}`
                            /* cSpell:enable */
                        },
                        "text": t("Header.navigation support request")
                    }
                ]}
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
