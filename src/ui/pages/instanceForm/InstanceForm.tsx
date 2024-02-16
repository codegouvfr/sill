import { useEffect } from "react";
import { routes, session } from "ui/routes";
import CircularProgress from "@mui/material/CircularProgress";
import { InstanceFormStep1 } from "ui/pages/instanceForm/Step1";
import { InstanceFormStep2 } from "ui/pages/instanceForm/Step2";
import { tss } from "tss-react/dsfr";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { fr } from "@codegouvfr/react-dsfr";
import { useConst } from "powerhooks/useConst";
import { Evt } from "evt";
import { useCoreState, useCore } from "core";
import { useEvt } from "evt/hooks";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { useTranslation } from "ui/i18n";
import { assert } from "tsafe/assert";
import { Equals } from "tsafe";
import { declareComponentKeys } from "i18nifty";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
import { ActionsFooter } from "ui/shared/ActionsFooter";
import type { PageRoute } from "./route";
import { useLang } from "ui/i18n";
import { LoadingFallback } from "ui/shared/LoadingFallback";

export type Props = {
    className?: string;
    route: PageRoute;
};

export default function InstanceForm(props: Props) {
    const { className, route, ...rest } = props;

    /** Assert to make sure all props are deconstructed */
    assert<Equals<typeof rest, {}>>();

    const { evtInstanceForm } = useCore().evts;

    const {
        instanceForm,
        softwareForm: { getExternalSoftwareOptions }
    } = useCore().functions;

    const {
        isReady,
        step,
        initializationData,
        allSillSoftwares,
        isSubmitting,
        isLastStep
    } = useCoreState("instanceForm", "main");

    useEffect(() => {
        instanceForm.initialize(
            (() => {
                switch (route.name) {
                    case "instanceCreationForm":
                        return {
                            "type": "create",
                            "softwareName": route.params.softwareName
                        };
                    case "instanceUpdateForm":
                        return {
                            "type": "update",
                            "instanceId": route.params.id
                        };
                }
            })()
        );

        return () => instanceForm.clear();
    }, [route.name]);

    useEvt(
        ctx =>
            evtInstanceForm.attach(
                action => action.action === "redirect",
                ctx,
                ({ softwareName }) =>
                    routes
                        .softwareDetails({ "name": softwareName, "tab": "instances" })
                        .push()
            ),
        []
    );

    const { classes, cx } = useStyles({ step });
    const { t } = useTranslation({ InstanceForm });
    const { t: tCommon } = useTranslation({ "App": null });

    const translationByRoute: Record<
        PageRoute["name"],
        { title: string; submitLabel: string; breadcrumbs: string }
    > = {
        instanceCreationForm: {
            title: t("title add instance form"),
            breadcrumbs: t("breadcrumb add instance"),
            submitLabel: tCommon("add instance")
        },
        instanceUpdateForm: {
            title: t("title update instance form"),
            breadcrumbs: t("breadcrumb update instance"),
            submitLabel: tCommon("update instance")
        }
    };

    const translations = translationByRoute[route.name];

    const evtActionSubmitStep = useConst(() => Evt.create());

    const { lang } = useLang();

    if (!isReady) {
        return <LoadingFallback className={className} showAfterMs={150} />;
    }

    return (
        <div className={className}>
            <div className={fr.cx("fr-container")}>
                <Breadcrumb
                    segments={[
                        {
                            "linkProps": {
                                ...routes.addSoftwareLanding().link
                            },
                            "label": tCommon("add software or service")
                        }
                    ]}
                    currentPageLabel={translations.breadcrumbs}
                    className={classes.breadcrumb}
                />
                <div className={classes.headerDeclareUserOrReferent}>
                    {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                    <a
                        href={"#"}
                        onClick={() => session.back()}
                        className={classes.backButton}
                    >
                        <i className={fr.cx("fr-icon-arrow-left-s-line")} />
                    </a>
                    <h4 className={classes.title}>{translations.title}</h4>
                </div>
                <Stepper
                    currentStep={step}
                    stepCount={2}
                    title={t("stepper title", { "currentStepIndex": step })}
                    className={classes.stepper}
                />
                <InstanceFormStep1
                    className={cx(classes.step, classes.step1)}
                    initialFormData={{
                        "mainSoftwareSillId": initializationData.mainSoftwareSillId,
                        "otherWikidataSoftwares": initializationData.otherSoftwares
                    }}
                    getLibreSoftwareWikidataOptions={queryString =>
                        getExternalSoftwareOptions({ queryString, "language": lang })
                    }
                    onSubmit={({ mainSoftwareSillId, otherWikidataSoftwares }) =>
                        instanceForm.completeStep1({
                            mainSoftwareSillId,
                            otherWikidataSoftwares
                        })
                    }
                    allSillSoftwares={allSillSoftwares}
                    evtActionSubmit={evtActionSubmitStep.pipe(() => step === 1)}
                />
                <InstanceFormStep2
                    className={cx(classes.step, classes.step2)}
                    initialFormData={{
                        "organization": initializationData.organization,
                        "publicUrl": initializationData.publicUrl,
                        "targetAudience": initializationData.targetAudience
                    }}
                    onSubmit={({ organization, publicUrl, targetAudience }) =>
                        instanceForm.submit({
                            organization,
                            publicUrl,
                            targetAudience
                        })
                    }
                    evtActionSubmit={evtActionSubmitStep.pipe(() => step === 2)}
                />
            </div>
            <ActionsFooter className={classes.footerContainer}>
                <Button
                    onClick={() => instanceForm.returnToPreviousStep()}
                    priority="secondary"
                    className={classes.softwareDetails}
                    disabled={step === 1}
                >
                    {tCommon("previous")}
                </Button>
                <Button
                    onClick={() => evtActionSubmitStep.post()}
                    priority="primary"
                    disabled={isSubmitting}
                >
                    {isLastStep ? (
                        <>
                            {translations.submitLabel}
                            {isSubmitting && (
                                <CircularProgress
                                    size={20}
                                    className={classes.progressSubmit}
                                />
                            )}
                        </>
                    ) : (
                        tCommon("next")
                    )}
                </Button>
            </ActionsFooter>
        </div>
    );
}

const useStyles = tss
    .withName({ InstanceForm })
    .withParams<{ step: number | undefined }>()
    .create(({ step }) => ({
        "step": {
            "flexDirection": "column",
            "gap": fr.spacing("8v")
        },
        "step1": {
            "display": step !== 1 ? "none" : "flex"
        },
        "step2": {
            "display": step !== 2 ? "none" : "flex",
            "& .fr-input-group, & .fr-fieldset": {
                ...fr.spacing("margin", {
                    "topBottom": 0
                })
            }
        },
        "breadcrumb": {
            "marginBottom": fr.spacing("4v")
        },
        "headerDeclareUserOrReferent": {
            "display": "flex",
            "alignItems": "center",
            "marginBottom": fr.spacing("10v")
        },
        "backButton": {
            "background": "none",
            "marginRight": fr.spacing("4v"),
            "&>i": {
                "&::before": {
                    "--icon-size": fr.spacing("8v")
                }
            }
        },
        "title": {
            "marginBottom": fr.spacing("1v")
        },
        "stepper": {
            "flex": "1"
        },
        "footerContainer": {
            "display": "flex",
            "alignItems": "center",
            "justifyContent": "end"
        },
        "softwareDetails": {
            "marginRight": fr.spacing("4v"),
            "&&::before": {
                "--icon-size": fr.spacing("6v")
            }
        },
        "progressSubmit": {
            "marginLeft": fr.spacing("4v")
        }
    }));

export const { i18n } = declareComponentKeys<
    | "breadcrumb add instance"
    | "breadcrumb update instance"
    | "title add instance form"
    | "title update instance form"
    | { K: "stepper title"; P: { currentStepIndex: number } }
    | "submit"
>()({ InstanceForm });
