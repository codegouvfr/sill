import { useState } from "react";
import { UserProfileFormFields } from "./shared/UserProfileFormFields";
import { tss } from "tss-react";
import { fr } from "@codegouvfr/react-dsfr";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import { useGetClassName } from "keycloakify/login/lib/useGetClassName";
import type { KcContext } from "../kcContext";
import type { I18n } from "../i18n";

export default function RegisterUserProfile(
    props: PageProps<Extract<KcContext, { pageId: "register-user-profile.ftl" }>, I18n>
) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes: classes_props } = props;

    const { getClassName } = useGetClassName({
        doUseDefaultCss,
        "classes": classes_props
    });

    const { url, messagesPerField, recaptchaRequired, recaptchaSiteKey } = kcContext;

    const { msg, msgStr } = i18n;
    const { classes } = useStyles();

    const [isFomSubmittable, setIsFomSubmittable] = useState(false);

    return (
        <Template
            {...{ kcContext, i18n, doUseDefaultCss, "classes": classes_props }}
            displayMessage={messagesPerField.exists("global")}
            headerNode={msg("registerTitle")}
        >
            <form
                id="kc-register-form"
                className={classes.centerCol}
                action={url.registrationAction}
                method="post"
            >
                <div className={classes.inputs}>
                    <UserProfileFormFields
                        kcContext={kcContext}
                        onIsFormSubmittableValueChange={setIsFomSubmittable}
                        i18n={i18n}
                        getClassName={getClassName}
                    />
                    {recaptchaRequired && (
                        <div className="form-group">
                            <div className={getClassName("kcInputWrapperClass")}>
                                <div
                                    className="g-recaptcha"
                                    data-size="compact"
                                    data-sitekey={recaptchaSiteKey}
                                />
                            </div>
                        </div>
                    )}
                    <div className={classes.buttons}>
                        <a
                            className={fr.cx("fr-btn", "fr-btn--secondary")}
                            href={url.loginUrl}
                        >
                            {msgStr("backToLogin")}
                        </a>
                        <input
                            className={fr.cx("fr-btn")}
                            type="submit"
                            value={msgStr("doRegister")}
                            disabled={!isFomSubmittable}
                        />
                    </div>
                </div>
            </form>
        </Template>
    );
}

const useStyles = tss.withName({ RegisterUserProfile }).create({
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
    "buttons": {
        "display": "flex",
        "gap": fr.spacing("4v"),
        "justifyContent": "end"
    }
});
