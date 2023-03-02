import { useEffect } from "react";
import { createGroup, type Route } from "type-route";
import { routes } from "ui-dsfr/routes";
import CircularProgress from "@mui/material/CircularProgress";
import { InstanceFormStep1 } from "./Step1";
import { InstanceFormStep2 } from "./Step2";
import { makeStyles } from "tss-react/dsfr";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { fr } from "@codegouvfr/react-dsfr";
import { useConst } from "powerhooks/useConst";
import { Evt } from "evt";
import { useCoreFunctions, useCoreState, useCoreEvts, selectors } from "core-dsfr";
import { useEvt } from "evt/hooks";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { useTranslation } from "ui-dsfr/i18n";
import { assert } from "tsafe/assert";
import { Equals } from "tsafe";
import { declareComponentKeys } from "i18nifty";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
import { ActionsFooter } from "../../shared/ActionsFooter";

InstanceForm.routeGroup = createGroup([
    routes.instanceCreationForm,
    routes.instanceUpdateForm
]);

type PageRoute = Route<typeof InstanceForm.routeGroup>;

InstanceForm.getDoRequireUserLoggedIn = () => true;

export type Props = {
    className?: string;
    route: PageRoute;
};

export function InstanceForm(props: Props) {
    const { className, route, ...rest } = props;

    /** Assert to make sure all props are deconstructed */
    assert<Equals<typeof rest, {}>>();

    const { step } = useCoreState(selectors.instanceForm.step);
    const { initializationData } = useCoreState(
        selectors.instanceForm.initializationData
    );
    const { allSillSoftwares } = useCoreState(selectors.instanceForm.allSillSoftwares);
    const { isSubmitting } = useCoreState(selectors.softwareForm.isSubmitting);
    const { isLastStep } = useCoreState(selectors.softwareForm.isLastStep);
    const { evtSoftwareForm } = useCoreEvts();

    const { instanceForm, softwareForm } = useCoreFunctions();

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
    const commoni18n = useTranslation({ "App": null });

    const evtActionSubmitStep = useConst(() => Evt.create());

    if (step === undefined) {
        return <CircularProgress />;
    }

    assert(initializationData !== undefined);
    assert(allSillSoftwares !== undefined);

    return (
        <div className={className}>
            <div className={fr.cx("fr-container")}>
                <Breadcrumb
                    segments={[
                        {
                            "linkProps": {
                                ...routes.addSoftwareLanding().link
                            },
                            "label": commoni18n.t("add software or service")
                        }
                    ]}
                    currentPageLabel={(() => {
                        switch (route.name) {
                            case "instanceCreationForm":
                                return "reference new instance";
                            case "instanceUpdateForm":
                                return "update instance";
                        }
                    })()}
                    className={classes.breadcrumb}
                />
                <Stepper
                    currentStep={step}
                    stepCount={2}
                    title={(() => {
                        switch (step) {
                            case 1:
                                return "A propos du ou des logiciels";
                            case 2:
                                return "Ajouter une instance logiciel";
                        }
                    })()}
                    className={classes.stepper}
                />
                <InstanceFormStep1
                    className={classes.step1}
                    initialFormData={{
                        "mainSoftwareSillId": initializationData.mainSoftwareSillId,
                        "otherSoftwares": initializationData.otherSoftwares
                    }}
                    getWikidataOptions={softwareForm.getWikidataOptions}
                    onSubmit={({ mainSoftwareSillId, otherSoftwares }) =>
                        instanceForm.completeStep1({
                            mainSoftwareSillId,
                            otherSoftwares
                        })
                    }
                    allSillSoftwares={allSillSoftwares}
                    evtActionSubmit={evtActionSubmitStep.pipe(() => step === 1)}
                />
                <InstanceFormStep2
                    className={classes.step2}
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
                    onClick={() => softwareForm.returnToPreviousStep()}
                    priority="secondary"
                    className={classes.softwareDetails}
                    disabled={step === 1}
                >
                    {commoni18n.t("previous")}
                </Button>
                <Button
                    onClick={() => evtActionSubmitStep.post()}
                    priority="primary"
                    disabled={isSubmitting}
                >
                    {isLastStep ? (
                        <>
                            {"submit"}{" "}
                            {isSubmitting && (
                                <CircularProgress className={classes.progressSubmit} />
                            )}
                        </>
                    ) : (
                        commoni18n.t("next")
                    )}
                </Button>
            </ActionsFooter>
        </div>
    );
}

const useStyles = makeStyles<{ step: number | undefined }>({
    "name": { InstanceForm }
})((_theme, { step }) => ({
    "step1": {
        "display": step !== 1 ? "none" : undefined
    },
    "step2": {
        "display": step !== 2 ? "none" : undefined
    },
    "breadcrumb": {
        "marginBottom": fr.spacing("4v")
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
    | "title software update form"
    | { K: "stepper title"; P: { currentStepIndex: number } }
    | "submit"
>()({ InstanceForm });