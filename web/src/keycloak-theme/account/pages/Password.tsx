import { useState, useEffect } from "react";
import type { PageProps } from "keycloakify/account/pages/PageProps";
import type { KcContext } from "../kcContext";
import type { I18n } from "../i18n";
import { fr } from "@codegouvfr/react-dsfr";
import { PasswordInput } from "@codegouvfr/react-dsfr/blocks/PasswordInput";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useStyles } from "tss-react/dsfr";

export default function Password(
    props: PageProps<Extract<KcContext, { pageId: "password.ftl" }>, I18n>
) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { css } = useStyles();

    const { url, password, account, stateChecker, message, referrer } = kcContext;

    const { msgStr, msg } = i18n;

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
    const [newPasswordError, setNewPasswordError] = useState("");
    const [newPasswordConfirmError, setNewPasswordConfirmError] = useState("");
    const [hasNewPasswordBlurred, setHasNewPasswordBlurred] = useState(false);
    // prettier-ignore
    const [hasNewPasswordConfirmBlurred, setHasNewPasswordConfirmBlurred] = useState(false);

    useEffect(() => {
        const appUrl = referrer?.url;

        if (appUrl === undefined) {
            return;
        }

        if (message?.type !== "success") {
            return;
        }

        setTimeout(() => {
            window.location.href = appUrl;
        }, 1000);
    }, []);

    const checkNewPassword = (newPassword: string) => {
        if (!password.passwordSet) {
            return;
        }

        if (newPassword === currentPassword) {
            setNewPasswordError(msgStr("newPasswordSameAsOld"));
        } else {
            setNewPasswordError("");
        }
    };

    const checkNewPasswordConfirm = (newPasswordConfirm: string) => {
        if (newPasswordConfirm === "") {
            return;
        }

        if (newPassword !== newPasswordConfirm) {
            setNewPasswordConfirmError(msgStr("passwordConfirmNotMatch"));
        } else {
            setNewPasswordConfirmError("");
        }
    };

    return (
        <Template
            {...{
                kcContext,
                i18n,
                doUseDefaultCss,
                classes
            }}
            active="password"
        >
            <h2
                className={css({
                    "marginBottom": fr.spacing("10v"),
                    [fr.breakpoints.down("md")]: {
                        "marginBottom": fr.spacing("8v")
                    }
                })}
            >
                {msg("changePasswordHtmlTitle")}
            </h2>

            <form
                action={url.passwordUrl}
                method="post"
                className={css({
                    "maxWidth": 650,
                    "margin": "auto",
                    [`& > .${fr.cx("fr-password")}:not(:first-of-type)`]: {
                        "marginTop": fr.spacing("10v")
                    }
                })}
            >
                <input
                    type="text"
                    id="username"
                    name="username"
                    value={account.username ?? ""}
                    autoComplete="username"
                    readOnly
                    style={{ "display": "none" }}
                />

                {password.passwordSet && (
                    <PasswordInput
                        label={msgStr("password") + " *"}
                        messagesHint={""}
                        nativeInputProps={{
                            "id": "password",
                            "name": "password",
                            "autoFocus": true,
                            "autoComplete": "current-password",
                            "value": currentPassword,
                            "onChange": event => setCurrentPassword(event.target.value)
                        }}
                    />
                )}

                <input
                    type="hidden"
                    id="stateChecker"
                    name="stateChecker"
                    value={stateChecker}
                />

                <PasswordInput
                    label={msgStr("passwordNew") + " *"}
                    messagesHint={""}
                    nativeInputProps={{
                        "id": "password-new",
                        "name": "password-new",
                        "autoComplete": "new-password",
                        "value": newPassword,
                        "onChange": event => {
                            const newPassword = event.target.value;

                            setNewPassword(newPassword);
                            if (hasNewPasswordBlurred) {
                                checkNewPassword(newPassword);
                            }
                        },
                        "onBlur": () => {
                            setHasNewPasswordBlurred(true);
                            checkNewPassword(newPassword);
                        }
                    }}
                    messages={
                        newPasswordError === ""
                            ? undefined
                            : [{ "severity": "error", "message": newPasswordError }]
                    }
                />

                <PasswordInput
                    label={msgStr("passwordConfirm") + " *"}
                    messagesHint={""}
                    nativeInputProps={{
                        "id": "password-confirm",
                        "name": "password-confirm",
                        "autoComplete": "new-password",
                        "value": newPasswordConfirm,
                        "onChange": event => {
                            const newPasswordConfirm = event.target.value;

                            setNewPasswordConfirm(newPasswordConfirm);
                            if (hasNewPasswordConfirmBlurred) {
                                checkNewPasswordConfirm(newPasswordConfirm);
                            }
                        },
                        "onBlur": () => {
                            setHasNewPasswordConfirmBlurred(true);
                            checkNewPasswordConfirm(newPasswordConfirm);
                        }
                    }}
                    messages={
                        newPasswordConfirmError === ""
                            ? undefined
                            : [
                                  {
                                      "severity": "error",
                                      "message": newPasswordConfirmError
                                  }
                              ]
                    }
                />

                <Button
                    className={css({ "float": "right", "marginTop": fr.spacing("10v") })}
                    disabled={newPasswordError !== "" || newPasswordConfirmError !== ""}
                    nativeButtonProps={{
                        "type": "submit",
                        "name": "submitAction",
                        "value": "Save"
                    }}
                >
                    {msg("doSave")}
                </Button>
            </form>
        </Template>
    );
}
