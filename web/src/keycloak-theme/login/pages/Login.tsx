import { useState, type FormEventHandler } from "react";
import { useConstCallback } from "keycloakify/tools/useConstCallback";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import { tss } from "tss-react/dsfr";
import { fr } from "@codegouvfr/react-dsfr";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { useGetClassName } from "keycloakify/login/lib/useGetClassName";
import type { KcContext } from "../kcContext";
import type { I18n } from "../i18n";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { PasswordInput } from "@codegouvfr/react-dsfr/blocks/PasswordInput";
import { AgentConnectButton } from "@codegouvfr/react-dsfr/AgentConnectButton";

export default function Login(
    props: PageProps<Extract<KcContext, { pageId: "login.ftl" }>, I18n>
) {
    const { kcContext, i18n, Template, doUseDefaultCss, classes: classes_props } = props;

    const { getClassName } = useGetClassName({
        doUseDefaultCss,
        "classes": classes_props
    });

    const { social, realm, url, usernameHidden, login, auth, registrationDisabled } =
        kcContext;

    const { msg, msgStr } = i18n;
    const { classes, cx } = useStyles();

    const [isLoginButtonDisabled, setIsLoginButtonDisabled] = useState(false);

    const onSubmit = useConstCallback<FormEventHandler<HTMLFormElement>>(e => {
        e.preventDefault();

        setIsLoginButtonDisabled(true);

        const formElement = e.target as HTMLFormElement;

        //NOTE: Even if we login with email Keycloak expect username and password in
        //the POST request.
        formElement
            .querySelector("input[name='email']")
            ?.setAttribute("name", "username");

        formElement.submit();
    });

    return (
        <Template
            {...{ kcContext, i18n, doUseDefaultCss, "classes": classes_props }}
            displayInfo={
                realm.password &&
                (realm.resetPasswordAllowed ||
                    (realm.registrationAllowed && !registrationDisabled))
            }
            displayWide={realm.password && social.providers !== undefined}
            headerNode={msg("connect")}
            infoNode={
                <div className={classes.resetAndRegister}>
                    {realm.resetPasswordAllowed && (
                        <a
                            tabIndex={5}
                            href={url.loginResetCredentialsUrl}
                            className={cx(
                                fr.cx(
                                    "fr-link",
                                    "fr-icon-arrow-right-line",
                                    "fr-link--icon-right"
                                ),
                                classes.forgotPassword
                            )}
                        >
                            {msgStr("doForgotPassword")}
                        </a>
                    )}
                    {realm.password &&
                        realm.registrationAllowed &&
                        !registrationDisabled && (
                            <a
                                tabIndex={6}
                                href={url.registrationUrl}
                                className={fr.cx(
                                    "fr-link",
                                    "fr-icon-arrow-right-line",
                                    "fr-link--icon-right"
                                )}
                            >
                                {msgStr("noAccount")}
                            </a>
                        )}
                </div>
            }
        >
            <div id="kc-form">
                <div id="kc-form-wrapper">
                    {realm.password && (
                        <form
                            id="kc-form-login"
                            onSubmit={onSubmit}
                            action={url.loginAction}
                            method="post"
                            className={classes.centerCol}
                        >
                            {realm.password && social.providers !== undefined && (
                                <div
                                    id="kc-social-providers"
                                    className={classes.agentConnect}
                                >
                                    <div
                                        className={cx(
                                            getClassName("kcFormSocialAccountListClass"),
                                            social.providers.length > 4 &&
                                                getClassName(
                                                    "kcFormSocialAccountDoubleListClass"
                                                )
                                        )}
                                    >
                                        {social.providers.map(p => (
                                            <div key={p.providerId}>
                                                {p.displayName
                                                    .toLocaleLowerCase()
                                                    .replace(/ /g, "")
                                                    .includes("agentconnect") ? (
                                                    <AgentConnectButton
                                                        style={{ "textAlign": "center" }}
                                                        url={p.loginUrl}
                                                    />
                                                ) : (
                                                    <Button
                                                        linkProps={{
                                                            "href": p.loginUrl
                                                        }}
                                                    >
                                                        {p.displayName}
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <h5>{msgStr("selfCredentials")}</h5>
                            <div className={classes.inputs}>
                                {(() => {
                                    const label = !realm.loginWithEmailAllowed
                                        ? "username"
                                        : realm.registrationEmailAsUsername
                                        ? "email"
                                        : "usernameOrEmail";

                                    const autoCompleteHelper: typeof label =
                                        label === "usernameOrEmail" ? "username" : label;

                                    return (
                                        <Input
                                            nativeInputProps={{
                                                "tabIndex": 1,
                                                "id": autoCompleteHelper,
                                                "name": autoCompleteHelper,
                                                "type": "email",
                                                "defaultValue": login.username ?? "",
                                                ...(usernameHidden
                                                    ? { "disabled": true }
                                                    : {
                                                          "autoFocus": true,
                                                          "autoComplete": "off"
                                                      })
                                            }}
                                            label={msgStr("email")}
                                            hintText={msgStr("email hint")}
                                        />
                                    );
                                })()}
                                <PasswordInput
                                    label={msgStr("password")}
                                    nativeInputProps={{
                                        "tabIndex": 2,
                                        "id": "password",
                                        "name": "password",
                                        "autoComplete": "off"
                                    }}
                                />
                                <div
                                    className={cx(
                                        getClassName("kcFormGroupClass"),
                                        getClassName("kcFormSettingClass")
                                    )}
                                >
                                    <div id="kc-form-options">
                                        {realm.rememberMe && !usernameHidden && (
                                            <Checkbox
                                                className={classes.rememberMe}
                                                options={[
                                                    {
                                                        "label": msg("rememberMe"),
                                                        "nativeInputProps": {
                                                            "tabIndex": 3,
                                                            "name": "rememberMe",
                                                            ...(login.rememberMe
                                                                ? {
                                                                      "checked": true
                                                                  }
                                                                : {})
                                                        }
                                                    }
                                                ]}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div
                                id="kc-form-buttons"
                                className={getClassName("kcFormGroupClass")}
                            >
                                <input
                                    type="hidden"
                                    id="id-hidden-input"
                                    name="credentialId"
                                    {...(auth?.selectedCredential !== undefined
                                        ? {
                                              "value": auth.selectedCredential
                                          }
                                        : {})}
                                />
                                <input
                                    tabIndex={4}
                                    className={fr.cx("fr-btn")}
                                    name="login"
                                    id="kc-login"
                                    type="submit"
                                    value={msgStr("connect")}
                                    disabled={isLoginButtonDisabled}
                                />
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </Template>
    );
}

const useStyles = tss.withName({ Login }).create({
    "centerCol": {
        "display": "flex",
        "flexDirection": "column",
        "alignItems": "center"
    },
    "inputs": {
        "display": "flex",
        "flexDirection": "column",
        "width": "100%"
    },
    "agentConnect": {
        "&&&": {
            "borderRight": "none"
        }
    },
    "forgotPassword": {
        "marginRight": fr.spacing("6v")
    },
    "resetAndRegister": {
        "display": "flex",
        "justifyContent": "center",
        "marginTop": fr.spacing("6v")
    },
    "rememberMe": {
        "marginTop": fr.spacing("5v")
    }
});
