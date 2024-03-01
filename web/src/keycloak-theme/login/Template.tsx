// Copy pasted from: https://github.com/InseeFrLab/keycloakify/blob/main/src/lib/components/shared/Template.tsx

// You can replace all relative imports by cherry picking files from the keycloakify module.
// For example, the following import:
// import { assert } from "./tools/assert";
// becomes:
import { clsx } from "keycloakify/tools/clsx";
import type { TemplateProps } from "keycloakify/login/TemplateProps";
import { usePrepareTemplate } from "keycloakify/lib/usePrepareTemplate";
import type { KcContext } from "./kcContext";
import type { I18n } from "./i18n";
import { tss } from "tss-react/dsfr";
import { useGetClassName } from "keycloakify/login/lib/useGetClassName";
import Header from "@codegouvfr/react-dsfr/Header";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { fr } from "@codegouvfr/react-dsfr";
import { appLocationOrigin } from "keycloak-theme/login/valuesTransferredOverUrl";
import { useBreakpointsValues } from "@codegouvfr/react-dsfr/useBreakpointsValues";
import { keyframes } from "tss-react";
import { LoadingFallback } from "ui/shared/LoadingFallback";
import { headerFooterDisplayItem } from "@codegouvfr/react-dsfr/Display";

export default function Template(props: TemplateProps<KcContext, I18n>) {
    const {
        displayInfo = false,
        displayMessage = true,
        displayRequiredFields = false,
        displayWide = false,
        showAnotherWayIfPresent = true,
        headerNode,
        showUsernameNode = null,
        children,
        infoNode = null,
        kcContext,
        i18n,
        doUseDefaultCss,
        classes: classes_props
    } = props;

    const { msg, msgStr } = i18n;

    const { getClassName } = useGetClassName({
        doUseDefaultCss,
        "classes": classes_props
    });

    const { auth, url, message, isAppInitiatedAction } = kcContext;

    const { breakpointsValues } = useBreakpointsValues();

    const { isReady } = usePrepareTemplate({
        "doFetchDefaultThemeResources": doUseDefaultCss,
        "styles": [
            `${url.resourcesCommonPath}/lib/zocial/zocial.css`,
            `${url.resourcesPath}/css/login.css`
        ],
        "htmlClassName": getClassName("kcHtmlClass"),
        "bodyClassName": getClassName("kcBodyClass")
    });

    const { classes, cx, css } = useStyles({ "contentWidth": breakpointsValues.sm });

    if (!isReady) {
        return <LoadingFallback className={css({ "height": "100vh" })} />;
    }

    return (
        <>
            <Header
                brandTop={
                    <span
                        dangerouslySetInnerHTML={{
                            "__html":
                                kcContext.properties.brandTop ||
                                "République<br/>Française"
                        }}
                    />
                }
                serviceTitle={
                    <span
                        dangerouslySetInnerHTML={{
                            "__html":
                                kcContext.properties.serviceTitle ||
                                kcContext.realm.displayNameHtml ||
                                kcContext.realm.displayName ||
                                ""
                        }}
                    />
                }
                quickAccessItems={[headerFooterDisplayItem]}
                homeLinkProps={{
                    "href":
                        appLocationOrigin ||
                        kcContext.properties.homeUrl ||
                        window.location.origin,
                    "title": `${msgStr("home")} - ${kcContext.realm.displayName ?? ""}`
                }}
            />
            <div className={cx(fr.cx("fr-container"), classes.container)}>
                <div
                    className={cx(
                        classes.centerCol,
                        displayWide && getClassName("kcFormCardAccountClass")
                    )}
                >
                    <header className={getClassName("kcFormHeaderClass")}>
                        {!(
                            auth !== undefined &&
                            auth.showUsername &&
                            !auth.showResetCredentials
                        ) ? (
                            displayRequiredFields ? (
                                <div className={getClassName("kcContentWrapperClass")}>
                                    <div
                                        className={clsx(
                                            getClassName("kcLabelWrapperClass"),
                                            "subtitle"
                                        )}
                                    >
                                        <span className="subtitle">
                                            <span className="required">*</span>
                                            {msg("requiredFields")}
                                        </span>
                                    </div>
                                    <div className="col-md-10">
                                        <h1 id="kc-page-title">{headerNode}</h1>
                                    </div>
                                </div>
                            ) : (
                                <h2 id="kc-page-title">{headerNode}</h2>
                            )
                        ) : displayRequiredFields ? (
                            <div className={getClassName("kcContentWrapperClass")}>
                                <div
                                    className={cx(
                                        getClassName("kcLabelWrapperClass"),
                                        "subtitle"
                                    )}
                                >
                                    <span className="subtitle">
                                        <span className="required">*</span>{" "}
                                        {msg("requiredFields")}
                                    </span>
                                </div>
                                <div className="col-md-10">
                                    {showUsernameNode}
                                    <div className={getClassName("kcFormGroupClass")}>
                                        <div id="kc-username">
                                            <label id="kc-attempted-username">
                                                {auth?.attemptedUsername}
                                            </label>
                                            <a
                                                id="reset-login"
                                                href={url.loginRestartFlowUrl}
                                            >
                                                <div className="kc-login-tooltip">
                                                    <i
                                                        className={getClassName(
                                                            "kcResetFlowIcon"
                                                        )}
                                                    />
                                                    <span className="kc-tooltip-text">
                                                        {msg("restartLoginTooltip")}
                                                    </span>
                                                </div>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {showUsernameNode}
                                <div className={getClassName("kcFormGroupClass")}>
                                    <div id="kc-username">
                                        <label id="kc-attempted-username">
                                            {auth?.attemptedUsername}
                                        </label>
                                        <a
                                            id="reset-login"
                                            href={url.loginRestartFlowUrl}
                                        >
                                            <div className="kc-login-tooltip">
                                                <i
                                                    className={getClassName(
                                                        "kcResetFlowIcon"
                                                    )}
                                                />
                                                <span className="kc-tooltip-text">
                                                    {msg("restartLoginTooltip")}
                                                </span>
                                            </div>
                                        </a>
                                    </div>
                                </div>
                            </>
                        )}
                    </header>
                    <div id="kc-content" className={classes.kcContent}>
                        <div id="kc-content-wrapper" className={classes.contentWrapper}>
                            {/* App-initiated actions should not see warning messages about the need to complete the action during login. */}
                            {displayMessage &&
                                message !== undefined &&
                                (message.type !== "warning" || !isAppInitiatedAction) && (
                                    <Alert
                                        closable
                                        severity={message.type}
                                        description={message.summary}
                                        className={classes.feedback}
                                        small
                                    />
                                )}
                            <div>{children}</div>
                            {auth !== undefined &&
                                auth.showTryAnotherWayLink &&
                                showAnotherWayIfPresent && (
                                    <form
                                        id="kc-select-try-another-way-form"
                                        action={url.loginAction}
                                        method="post"
                                        className={cx(
                                            displayWide &&
                                                getClassName("kcContentWrapperClass")
                                        )}
                                    >
                                        <div
                                            className={cx(
                                                displayWide && [
                                                    getClassName(
                                                        "kcFormSocialAccountContentClass"
                                                    ),
                                                    getClassName(
                                                        "kcFormSocialAccountClass"
                                                    )
                                                ]
                                            )}
                                        >
                                            <div
                                                className={getClassName(
                                                    "kcFormGroupClass"
                                                )}
                                            >
                                                <input
                                                    type="hidden"
                                                    name="tryAnotherWay"
                                                    value="on"
                                                />
                                                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                                                <a
                                                    href="#"
                                                    id="try-another-way"
                                                    onClick={() => {
                                                        document.forms[
                                                            "kc-select-try-another-way-form" as never
                                                        ].submit();
                                                        return false;
                                                    }}
                                                >
                                                    {msg("doTryAnotherWay")}
                                                </a>
                                            </div>
                                        </div>
                                    </form>
                                )}
                            {displayInfo && (
                                <div
                                    id="kc-info"
                                    className={getClassName("kcSignUpClass")}
                                >
                                    <div
                                        id="kc-info-wrapper"
                                        className={getClassName("kcInfoAreaWrapperClass")}
                                    >
                                        {infoNode}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

const useStyles = tss
    .withName({ Template })
    .withParams<{ contentWidth: number }>()
    .create(({ contentWidth }) => ({
        "container": {
            "marginTop": fr.spacing("10v"),
            "animation": `${keyframes`
            0% {
                opacity: 0;
            }
            100% {
                opacity: 1;
            }
            `} 400ms`
        },
        "centerCol": {
            "display": "flex",
            "flexDirection": "column",
            "alignItems": "center"
        },
        "feedback": {
            "marginBottom": fr.spacing("6v")
        },
        "kcContent": {
            "width": "100%"
        },
        "contentWrapper": {
            "maxWidth": `${contentWidth}px`,
            "width": "100%",
            "margin": "0 auto"
        }
    }));
