import { useRerenderOnStateChange } from "evt/hooks";
import { Markdown } from "keycloakify/tools/Markdown";
import {
    evtTermMarkdown,
    useDownloadTerms
} from "keycloakify/login/lib/useDownloadTerms";
import tos_en_url from "../assets/tos_en.md";
import tos_fr_url from "../assets/tos_fr.md";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import { tss } from "tss-react/dsfr";
import { symToStr } from "tsafe/symToStr";
import { fr } from "@codegouvfr/react-dsfr";
import { useGetClassName } from "keycloakify/login/lib/useGetClassName";
import type { KcContext } from "../kcContext";
import type { I18n } from "../i18n";

export default function Terms(
    props: PageProps<Extract<KcContext, { pageId: "terms.ftl" }>, I18n>
) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes: classes_props } = props;

    const { msg, msgStr } = i18n;
    const { classes, cx } = useStyles();

    const { getClassName } = useGetClassName({
        doUseDefaultCss,
        "classes": classes_props
    });

    useDownloadTerms({
        kcContext,
        "downloadTermMarkdown": async ({ currentLanguageTag }) => {
            const markdownString = await fetch(
                (() => {
                    switch (currentLanguageTag) {
                        case "fr":
                            return tos_fr_url;
                        default:
                            return tos_en_url;
                    }
                })()
            ).then(response => response.text());

            return markdownString;
        }
    });

    useRerenderOnStateChange(evtTermMarkdown);

    const { url } = kcContext;

    if (evtTermMarkdown.state === undefined) {
        return null;
    }

    return (
        <Template
            {...{ kcContext, i18n, doUseDefaultCss, "classes": classes_props }}
            displayMessage={false}
            headerNode={msg("termsTitle")}
        >
            <div id="kc-terms-text">
                {evtTermMarkdown.state && <Markdown>{evtTermMarkdown.state}</Markdown>}
            </div>
            <form
                className={cx("form-actions", classes.formActions)}
                action={url.loginAction}
                method="POST"
            >
                <input
                    className={cx(
                        getClassName("kcButtonClass"),
                        getClassName("kcButtonClass"),
                        getClassName("kcButtonClass"),
                        getClassName("kcButtonPrimaryClass"),
                        getClassName("kcButtonLargeClass")
                    )}
                    name="accept"
                    id="kc-accept"
                    type="submit"
                    value={msgStr("doAccept")}
                />
                <input
                    className={cx(
                        getClassName("kcButtonClass"),
                        getClassName("kcButtonDefaultClass"),
                        getClassName("kcButtonLargeClass")
                    )}
                    name="cancel"
                    id="kc-decline"
                    type="submit"
                    value={msgStr("doDecline")}
                />
            </form>
            <div className="clearfix" />
        </Template>
    );
}

const useStyles = tss.withName(symToStr({ Terms })).createUseStyles({
    "formActions": {
        "display": "flex",
        "gap": fr.spacing("4v")
    }
});
