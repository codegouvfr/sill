import { HeaderQuickAccessItem } from "@codegouvfr/react-dsfr/Header";
import { declareComponentKeys } from "ui/i18n";
import { useTranslation } from "react-i18next";
import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";
import { routes } from "ui/routes";

type Props = {
    id?: string;
    isOnPageMyAccount: boolean;
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

export function AuthButtons(props: Props) {
    const { id, isOnPageMyAccount, userAuthenticationApi } = props;

    const { t } = useTranslation();

    const { classes, cx } = useStyles({ isOnPageMyAccount });

    if (!userAuthenticationApi.isUserLoggedIn) {
        return (
            <>
                <HeaderQuickAccessItem
                    id={`login-${id}`}
                    quickAccessItem={{
                        iconId: "fr-icon-lock-line",
                        buttonProps: {
                            onClick: () => userAuthenticationApi.login()
                        },
                        text: t("AuthButtons.login")
                    }}
                />
                <HeaderQuickAccessItem
                    id={`register-${id}`}
                    quickAccessItem={{
                        iconId: "ri-id-card-line",
                        buttonProps: {
                            onClick: () => userAuthenticationApi.register()
                        },
                        text: t("AuthButtons.register")
                    }}
                />
            </>
        );
    }

    return (
        <>
            <HeaderQuickAccessItem
                id={`account-${id}`}
                quickAccessItem={
                    {
                        "iconId": "fr-icon-account-fill",
                        "linkProps": {
                            "className": cx(
                                fr.cx("fr-btn--tertiary"),
                                classes.myAccountButton
                            ),
                            ...routes.account().link
                        },
                        "text": t("AuthButtons.account")
                    } as const
                }
            />
            <HeaderQuickAccessItem
                id={`logout-${id}`}
                quickAccessItem={{
                    iconId: "ri-logout-box-line",
                    buttonProps: {
                        onClick: () => userAuthenticationApi.logout()
                    },
                    text: t("AuthButtons.logout")
                }}
            />
        </>
    );
}

export const { i18n } = declareComponentKeys<
    "login" | "register" | "logout" | "account"
>()({ AuthButtons });

const useStyles = tss
    .withName({ AuthButtons })
    .withParams<{ isOnPageMyAccount: boolean }>()
    .create(({ isOnPageMyAccount }) => ({
        "myAccountButton": {
            "&&": {
                "backgroundColor": !isOnPageMyAccount
                    ? undefined
                    : fr.colors.decisions.background.default.grey.hover
            }
        }
    }));
