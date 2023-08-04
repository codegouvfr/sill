import { useEffect, useState, useMemo } from "react";
import { makeStyles } from "tss-react/dsfr";
import { fr } from "@codegouvfr/react-dsfr";
import { useTranslation, useGetOrganizationFullName, evtLang } from "ui/i18n";
import { assert } from "tsafe/assert";
import { Equals } from "tsafe";
import { declareComponentKeys } from "i18nifty";
import { useCoreFunctions, useCoreState, selectors } from "core";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { z } from "zod";
import { AutocompleteFreeSoloInput } from "ui/shared/AutocompleteFreeSoloInput";
import { Button } from "@codegouvfr/react-dsfr/Button";
import type { PageRoute } from "./route";
import { LoadingFallback } from "ui/shared/LoadingFallback";
import CircularProgress from "@mui/material/CircularProgress";
import MDEditor from "@uiw/react-md-editor";
import { useIsDark } from "@codegouvfr/react-dsfr/useIsDark";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import aboutTemplateEnUrl from "ui/assets/about_template_en.md";
import aboutTemplateFrUrl from "ui/assets/about_template_fr.md";
import { useAsync } from "ui/tools/useAsync";
import { useRerenderOnStateChange } from "evt/hooks";
import { Evt } from "evt";
import { useConst } from "powerhooks/useConst";

type Props = {
    className?: string;
    route: PageRoute;
};

export default function Account(props: Props) {
    const { className, route, ...rest } = props;

    /** Assert to make sure all props are deconstructed */
    assert<Equals<typeof rest, {}>>();

    const { userAccountManagement } = useCoreFunctions();
    const { readyState } = useCoreState(selectors.userAccountManagement.readyState);

    console.log({ readyState });

    useEffect(() => {
        userAccountManagement.initialize();
    }, []);

    if (readyState === undefined) {
        return <LoadingFallback />;
    }

    return <AccountReady className={className} />;
}

function AccountReady(props: { className?: string }) {
    const { className } = props;

    const { t } = useTranslation({ Account });

    const {
        allOrganizations,
        email,
        organization,
        about,
        doSupportPasswordReset,
        allowedEmailRegExp
    } = (function useClosure() {
        const { readyState } = useCoreState(selectors.userAccountManagement.readyState);

        assert(readyState !== undefined);

        const { allowedEmailRegexpStr, ...rest } = readyState;

        const allowedEmailRegExp = useMemo(
            () => new RegExp(allowedEmailRegexpStr),
            [allowedEmailRegexpStr]
        );

        return {
            ...rest,
            allowedEmailRegExp
        };
    })();

    const { isDark } = useIsDark();

    const { userAccountManagement } = useCoreFunctions();

    const [emailInputValue, setEmailInputValue] = useState(email.value);
    /* prettier-ignore */
    const [organizationInputValue, setOrganizationInputValue] = useState(organization.value);

    const evtAboutInputValue = useConst(() => Evt.create(about.value));

    useRerenderOnStateChange(evtAboutInputValue);

    useAsync(async () => {
        const response = await fetch(
            (() => {
                switch (evtLang.state) {
                    case "fr":
                        return aboutTemplateFrUrl;
                    default:
                        return aboutTemplateEnUrl;
                }
            })()
        );
        const text = await response.text();

        if (evtAboutInputValue.state !== "") {
            return;
        }

        evtAboutInputValue.state = text;
    }, []);

    const emailInputValueErrorMessage = (() => {
        try {
            z.string().email().parse(emailInputValue);
        } catch {
            return t("not a valid email");
        }

        if (!allowedEmailRegExp.test(emailInputValue)) {
            return t("email domain not allowed", {
                "domain": emailInputValue.split("@")[1]
            });
        }

        return undefined;
    })();

    const { classes, cx, css } = useStyles();

    const { getOrganizationFullName } = useGetOrganizationFullName();

    return (
        <div className={className}>
            <div className={cx(fr.cx("fr-container"), classes.oidcInfos)}>
                <h2 className={classes.title}>{t("title")}</h2>
                <div className={classes.inputAndPaddingBlockWrapper}>
                    <div className={classes.inputWrapper}>
                        <Input
                            className={cx(classes.input)}
                            label={t("mail")}
                            nativeInputProps={{
                                "onChange": event =>
                                    setEmailInputValue(event.target.value),
                                "value": emailInputValue,
                                "name": "email",
                                "type": "email",
                                "id": "email",
                                "onKeyDown": event => {
                                    if (event.key === "Escape") {
                                        setEmailInputValue(email.value);
                                    }
                                }
                            }}
                            state={
                                emailInputValueErrorMessage === undefined
                                    ? undefined
                                    : "error"
                            }
                            stateRelatedMessage={emailInputValueErrorMessage}
                            disabled={email.isBeingUpdated}
                        />

                        <div className={classes.submitButtonWrapper}>
                            {email.isBeingUpdated && (
                                <CircularProgress
                                    className={classes.circularProgress}
                                    size={30}
                                />
                            )}
                            <Button
                                className={css({
                                    "visibility": !(
                                        email.value !== emailInputValue &&
                                        emailInputValueErrorMessage === undefined &&
                                        !email.isBeingUpdated
                                    )
                                        ? "hidden"
                                        : undefined
                                })}
                                onClick={() =>
                                    userAccountManagement.updateField({
                                        "fieldName": "email",
                                        "value": emailInputValue
                                    })
                                }
                            >
                                {t("update")}
                            </Button>
                        </div>
                    </div>
                    <div className={classes.paddingBlock} />
                </div>
                <div className={classes.inputAndPaddingBlockWrapper}>
                    <div className={classes.inputWrapper}>
                        <AutocompleteFreeSoloInput
                            className={classes.input}
                            options={allOrganizations}
                            getOptionLabel={organization =>
                                getOrganizationFullName(organization)
                            }
                            value={organization.value}
                            onValueChange={value => setOrganizationInputValue(value)}
                            dsfrInputProps={{
                                "label": t("organization"),
                                "disabled": organization.isBeingUpdated
                            }}
                        />
                        <div className={classes.submitButtonWrapper}>
                            {organization.isBeingUpdated && (
                                <CircularProgress
                                    className={classes.circularProgress}
                                    size={30}
                                />
                            )}
                            <Button
                                className={css({
                                    "visibility": !(
                                        organization.value !== organizationInputValue &&
                                        !organization.isBeingUpdated
                                    )
                                        ? "hidden"
                                        : undefined
                                })}
                                onClick={() =>
                                    userAccountManagement.updateField({
                                        "fieldName": "organization",
                                        "value": organizationInputValue
                                    })
                                }
                                disabled={organization.value === organizationInputValue}
                            >
                                {t("update")}
                            </Button>
                        </div>
                    </div>
                    <div className={classes.paddingBlock} />
                </div>
                {doSupportPasswordReset && (
                    <a
                        className={classes.resetPasswordLink}
                        href={userAccountManagement.getPasswordResetUrl()}
                    >
                        {t("change password")}
                    </a>
                )}
            </div>

            <div className={cx(fr.cx("fr-container"))}>
                <h2>About you</h2>
                <p>
                    This is a place to introduce yourself, what you do. How are you
                    using/contributing to open source. And general information that you
                    would like to share about yourself with the SILL community.
                </p>
                <Checkbox
                    options={[
                        {
                            label: "Make my profile public",
                            nativeInputProps: {
                                name: "checkboxes-1",
                                value: "value1"
                            }
                        }
                    ]}
                    stateRelatedMessage="En cochant cette case vous rendez votre profil visible par les autres agens connécté au SILL."
                />

                <div data-color-mode={isDark ? "dark" : "light"}>
                    <MDEditor
                        value={evtAboutInputValue.state}
                        onChange={value => {
                            evtAboutInputValue.state = value ?? "";
                        }}
                    />
                </div>
                <div style={{ "display": "flex", "marginTop": fr.spacing("4w") }}>
                    <div style={{ "flex": 1 }} />
                    <div>
                        <Button
                            className={css({
                                "visibility":
                                    about.isBeingUpdated || true ? "hidden" : undefined
                            })}
                            onClick={() =>
                                userAccountManagement.updateField({
                                    "fieldName": "about",
                                    "value": evtAboutInputValue.state
                                })
                            }
                            disabled={about.value === evtAboutInputValue.state}
                        >
                            {t("update")}
                        </Button>
                        {(about.isBeingUpdated || true) && <CircularProgress size={30} />}
                    </div>
                </div>
            </div>
        </div>
    );
}

const useStyles = makeStyles({
    "name": { Account }
})({
    "oidcInfos": {
        "paddingTop": fr.spacing("6v"),
        "maxWidth": 650,
        "paddingBottom": fr.spacing("6v")
    },
    "title": {
        "marginBottom": fr.spacing("10v"),
        [fr.breakpoints.down("md")]: {
            "marginBottom": fr.spacing("8v")
        }
    },
    "inputAndPaddingBlockWrapper": {
        "position": "relative"
    },
    "inputWrapper": {
        "position": "absolute",
        "display": "flex",
        "width": "100%",
        [fr.breakpoints.down("md")]: {
            "flexDirection": "column"
        }
    },
    "input": {
        "flex": 1,
        [fr.breakpoints.down("md")]: {
            "width": "100%"
        }
    },
    "submitButtonWrapper": {
        "alignSelf": "flex-start",
        "marginLeft": fr.spacing("3v"),
        "position": "relative",
        "top": 32,
        [fr.breakpoints.down("md")]: {
            "top": -5,
            "marginLeft": "unset",
            "width": "100%",
            "display": "flex",
            "justifyContent": "flex-end"
        }
    },
    "circularProgress": {
        "position": "absolute",
        "left": "calc(50% - 15px)",
        "top": 5
    },
    "paddingBlock": {
        "height": 125,
        [fr.breakpoints.down("md")]: {
            "height": 150
        }
    },
    "resetPasswordLink": {
        "marginTop": fr.spacing("6v")
    }
});

export const { i18n } = declareComponentKeys<
    | "title"
    | "mail"
    | "organization"
    | "change password"
    | "no organization"
    | "update"
    | "not a valid email"
    | {
          K: "email domain not allowed";
          P: { domain: string };
      }
>()({ Account });
