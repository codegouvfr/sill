import { useEffect } from "react";
import { routes, session } from "ui/routes";
import CircularProgress from "@mui/material/CircularProgress";
import { SoftwareFormStep1 } from "ui/pages/softwareForm/Step1";
import { SoftwareFormStep2 } from "ui/pages/softwareForm/Step2";
import { SoftwareFormStep3 } from "ui/pages/softwareForm/Step3";
import { SoftwareFormStep4 } from "ui/pages/softwareForm/Step4";
import { tss } from "tss-react/dsfr";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { fr } from "@codegouvfr/react-dsfr";
import { useConst } from "powerhooks/useConst";
import { Evt } from "evt";
import { useCoreFunctions, useCoreState, useCoreEvts, selectors } from "core";
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

type Props = {
    className?: string;
    route: PageRoute;
};

const stepCount = 4;

export default function SoftwareForm(props: Props) {
    const { className, route, ...rest } = props;

    /** Assert to make sure all props are deconstructed */
    assert<Equals<typeof rest, {}>>();

    const { step } = useCoreState(selectors.softwareForm.step);
    const { formData } = useCoreState(selectors.softwareForm.formData);
    const { isSubmitting } = useCoreState(selectors.softwareForm.isSubmitting);
    const { isLastStep } = useCoreState(selectors.softwareForm.isLastStep);
    const { evtSoftwareForm } = useCoreEvts();

    const { softwareForm } = useCoreFunctions();

    useEffect(() => {
        softwareForm.initialize(
            (() => {
                switch (route.name) {
                    case "softwareCreationForm":
                        return {
                            "scenario": "create",
                            "wikidataId": route.params.wikidataId
                        };
                    case "softwareUpdateForm":
                        return {
                            "scenario": "update",
                            "softwareName": route.params.name
                        };
                }
            })()
        );

        return () => softwareForm.clear();
    }, [route.name]);

    useEvt(
        ctx =>
            evtSoftwareForm.attach(
                action => action.action === "redirect",
                ctx,
                ({ softwareName }) =>
                    routes.softwareDetails({ "name": softwareName }).push()
            ),
        []
    );

    const { classes } = useStyles({ step });
    const { t } = useTranslation({ SoftwareForm });
    const { t: tCommon } = useTranslation({ "App": undefined });

    const evtActionSubmitStep = useConst(() => Evt.create());

    const { lang } = useLang();

    if (formData === undefined) {
        return <LoadingFallback className={className} showAfterMs={150} />;
    }

    assert(step !== undefined);

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
                    currentPageLabel={(() => {
                        switch (route.name) {
                            case "softwareCreationForm":
                                return tCommon("add software");
                            case "softwareUpdateForm":
                                return tCommon("update software");
                        }
                    })()}
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
                    <h4 className={classes.title}>
                        {(() => {
                            switch (route.name) {
                                case "softwareCreationForm":
                                    return t("add software", {
                                        "name": formData.step2?.softwareName
                                    });
                                case "softwareUpdateForm":
                                    return t("update software", {
                                        "name": formData.step2?.softwareName ?? ""
                                    });
                            }
                        })()}
                    </h4>
                </div>
                <Stepper
                    currentStep={step}
                    stepCount={stepCount}
                    title={t("stepper title", {
                        "currentStepIndex": step,
                        "softwareName": formData.step2?.softwareName,
                        "action": (() => {
                            switch (route.name) {
                                case "softwareCreationForm":
                                    return "add";
                                case "softwareUpdateForm":
                                    return "update";
                            }
                        })()
                    })}
                    className={classes.stepper}
                />
                <SoftwareFormStep1
                    className={classes.step1}
                    initialFormData={formData.step1}
                    onSubmit={formData =>
                        softwareForm.setStep1Data({
                            "formDataStep1": formData
                        })
                    }
                    evtActionSubmit={evtActionSubmitStep.pipe(() => step === 1)}
                />
                <SoftwareFormStep2
                    className={classes.step2}
                    isUpdateForm={route.name === "softwareUpdateForm"}
                    initialFormData={formData.step2}
                    onSubmit={formData =>
                        softwareForm.setStep2Data({
                            "formDataStep2": formData
                        })
                    }
                    getAutofillDataFromWikidata={softwareForm.getAutofillData}
                    getLibreSoftwareWikidataOptions={queryString =>
                        softwareForm.getLibreSoftwareWikidataOptions({
                            "language": lang,
                            queryString
                        })
                    }
                    evtActionSubmit={evtActionSubmitStep.pipe(() => step === 2)}
                />
                <SoftwareFormStep3
                    className={classes.step3}
                    initialFormData={formData.step3}
                    onSubmit={formData =>
                        softwareForm.setStep3Data({
                            "formDataStep3": formData
                        })
                    }
                    isCloudNativeSoftware={formData.step1?.softwareType.type === "cloud"}
                    evtActionSubmit={evtActionSubmitStep.pipe(() => step === 3)}
                />
                <SoftwareFormStep4
                    className={classes.step4}
                    initialFormData={formData.step4}
                    evtActionSubmit={evtActionSubmitStep.pipe(() => step === 4)}
                    onSubmit={formData =>
                        softwareForm.setStep4DataAndSubmit({
                            "formDataStep4": formData
                        })
                    }
                    getWikidataOptions={queryString =>
                        softwareForm.getWikidataOptions({ "language": lang, queryString })
                    }
                />
            </div>
            <ActionsFooter className={classes.footerContainer}>
                <Button
                    onClick={() => softwareForm.returnToPreviousStep()}
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
                            {(() => {
                                switch (route.name) {
                                    case "softwareCreationForm":
                                        return t("add software", {
                                            "name": formData.step2?.softwareName
                                        });
                                    case "softwareUpdateForm":
                                        return t("update software", {
                                            "name": formData.step2?.softwareName ?? ""
                                        });
                                }
                            })()}

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
    .withName({ SoftwareForm })
    .withParams<{ step: number | undefined }>()
    .create(({ step }) => ({
        "step1": {
            "display": step !== 1 ? "none" : undefined
        },
        "step2": {
            "display": step !== 2 ? "none" : undefined
        },
        "step3": {
            "display": step !== 3 ? "none" : undefined
        },
        "step4": {
            "display": step !== 4 ? "none" : undefined
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
    | {
          K: "stepper title";
          P: {
              currentStepIndex: number;
              softwareName: string | undefined;
              action: "add" | "update";
          };
      }
    | {
          K: "add software";
          P: { name: string | undefined };
      }
    | {
          K: "update software";
          P: { name: string };
      }
    | {
          K: "add software button";
          P: { name: string };
      }
    | {
          K: "update software button";
          P: { name: string };
      }
>()({ SoftwareForm });
