// Copy pasted from: https://github.com/InseeFrLab/keycloakify/blob/main/src/login/Template.tsx

import { clsx } from "keycloakify/tools/clsx";
import { usePrepareTemplate } from "keycloakify/lib/usePrepareTemplate";
import { type TemplateProps } from "keycloakify/account/TemplateProps";
import { useGetClassName } from "keycloakify/account/lib/useGetClassName";
import type { KcContext } from "./kcContext";
import type { I18n } from "./i18n";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Header } from "@codegouvfr/react-dsfr/Header";
import { Footer } from "@codegouvfr/react-dsfr/Footer";
import { headerFooterDisplayItem } from "@codegouvfr/react-dsfr/Display";
import { fr } from "@codegouvfr/react-dsfr";
import { MuiDsfrThemeProvider } from "@codegouvfr/react-dsfr/mui";

export default function Template(props: TemplateProps<KcContext, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, classes, children } = props;

    const { getClassName } = useGetClassName({ doUseDefaultCss, classes });

    const { msg } = i18n;

    const { url, message, referrer } = kcContext;

    const { isReady } = usePrepareTemplate({
        "doFetchDefaultThemeResources": doUseDefaultCss,
        "styles": [
            `${url.resourcesCommonPath}/node_modules/patternfly/dist/css/patternfly.min.css`,
            `${url.resourcesCommonPath}/node_modules/patternfly/dist/css/patternfly-additions.min.css`,
            `${url.resourcesPath}/css/account.css`
        ],
        "htmlClassName": undefined,
        "bodyClassName": clsx("admin-console", "user", getClassName("kcBodyClass"))
    });

    if (!isReady) {
        return null;
    }

    return (
        <div
            style={{
                height: "100vh",
                display: "flex",
                flexDirection: "column"
            }}
        >
            <Header
                brandTop={
                    // cspell: disable-next-line
                    <>
                        {" "}
                        République <br /> Française{" "}
                    </>
                }
                homeLinkProps={{
                    "href": referrer?.url,
                    "title": "Go back to the website"
                }}
                quickAccessItems={[
                    {
                        "iconId": "fr-icon-lock-line",
                        "linkProps": {
                            "href": url.getLogoutUrl()
                        },
                        "text": msg("doSignOut")
                    }
                ]}
                serviceTitle={serviceTitle}
            />
            <div
                className={fr.cx("fr-container")}
                style={{
                    "maxWidth": 600,
                    "flex": 1,
                    ...fr.spacing("padding", {
                        "topBottom": "10v"
                    })
                }}
            >
                <MuiDsfrThemeProvider>
                    {message !== undefined && (
                        <Alert
                            style={{
                                "marginBottom": fr.spacing("6v")
                            }}
                            small
                            severity={message.type}
                            description={message.summary}
                        />
                    )}
                    {children}
                </MuiDsfrThemeProvider>
            </div>
            <Footer
                accessibility="partially compliant"
                bottomItems={[headerFooterDisplayItem]}
            />
        </div>
    );
}

const serviceTitle = "Socle interministériel de logiciels libres";
