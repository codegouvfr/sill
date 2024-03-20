import { lazy, Suspense } from "react";
import type { PageProps } from "keycloakify/account";
import type { KcContext } from "./kcContext";
import { useI18n } from "./i18n";

const Template = lazy(() => import("./Template"));
const DefaultTemplate = lazy(() => import("keycloakify/account/Template"));

const Password = lazy(() => import("./pages/Password"));
const Fallback = lazy(() => import("keycloakify/account"));

const classes: PageProps<any, any>["classes"] = {};

export default function KcApp(props: { kcContext: KcContext }) {
    const { kcContext } = props;

    const i18n = useI18n({ kcContext });

    if (i18n === null) {
        return null;
    }

    return (
        <Suspense>
            {(() => {
                switch (kcContext.pageId) {
                    case "password.ftl":
                        return (
                            <Password
                                {...{ kcContext, i18n, Template, classes }}
                                doUseDefaultCss={false}
                            />
                        );
                    default:
                        return (
                            <Fallback
                                {...{ kcContext, i18n, classes }}
                                Template={DefaultTemplate}
                                doUseDefaultCss={true}
                            />
                        );
                }
            })()}
        </Suspense>
    );
}
