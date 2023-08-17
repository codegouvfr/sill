import { lazy, Suspense, useEffect } from "react";
import { tss } from "tss-react/dsfr";
import { fr } from "@codegouvfr/react-dsfr";
import { symToStr } from "tsafe/symToStr";
import Fallback, { type PageProps } from "keycloakify/login";
import type { KcContext } from "./kcContext";
import { useI18n } from "./i18n";
// Leave it this way, it must always be evaluated.
import { isDark as isAppDark } from "./valuesTransferredOverUrl";
import { useIsDark } from "@codegouvfr/react-dsfr/useIsDark";

const Template = lazy(() => import("./Template"));
const Login = lazy(() => import("./pages/Login"));
const RegisterUserProfile = lazy(() => import("./pages/RegisterUserProfile"));
const Terms = lazy(() => import("./pages/Terms"));

export default function KcApp(props: { kcContext: KcContext }) {
    const { kcContext } = props;

    const i18n = useI18n({ kcContext });

    const { classes, cx, css } = useStyles();

    {
        const { setIsDark } = useIsDark();

        useEffect(() => {
            if (isAppDark === undefined) {
                return;
            }

            setIsDark(isAppDark);
        }, [isAppDark]);
    }

    //NOTE: Locales not yet downloaded
    if (i18n === null) {
        return null;
    }

    const pageProps: Omit<PageProps<any, typeof i18n>, "kcContext"> = {
        i18n,
        Template,
        "doUseDefaultCss": false,
        "classes": {
            "kcHtmlClass": classes.kcHtmlClass,
            "kcButtonPrimaryClass": cx(classes.kcButtonPrimaryClass, fr.cx("fr-btn")),
            "kcInputClass": fr.cx("fr-input"),
            "kcLabelWrapperClass": cx(
                fr.cx("fr-label"),
                css({
                    "marginBottom": fr.spacing("2v")
                })
            ),
            "kcFormOptionsWrapperClass": css({
                "marginTop": fr.spacing("5v")
            })
        }
    };

    return (
        <Suspense>
            {(() => {
                switch (kcContext.pageId) {
                    case "login.ftl":
                        return <Login {...{ kcContext, ...pageProps }} />;
                    case "register-user-profile.ftl":
                        return <RegisterUserProfile {...{ kcContext, ...pageProps }} />;
                    case "terms.ftl":
                        return <Terms {...{ kcContext, ...pageProps }} />;
                    default:
                        return <Fallback {...{ kcContext, ...pageProps }} />;
                }
            })()}
        </Suspense>
    );
}

const useStyles = tss.withName(symToStr({ KcApp })).createUseStyles({
    "kcHtmlClass": {
        "fontSize": "unset",
        "& label": {
            "fontWeight": "unset"
        },
        "& #kc-header-wrapper": {
            "visibility": "hidden"
        },
        "& a": {
            "&:hover, &:focus": {
                "textDecoration": "unset"
            }
        },
        "& #kc-form-buttons": {
            "float": "right"
        }
    },
    "kcButtonPrimaryClass": {
        "&:hover": {
            "color": fr.colors.decisions.text.inverted.blueFrance.default
        }
    }
});
