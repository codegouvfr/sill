import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useCoreState, useCore } from "core";
import { Evt } from "evt";
import { useEvt } from "evt/hooks";
import { useRerenderOnStateChange } from "evt/hooks";
import { declareComponentKeys } from "i18nifty";
import { useTranslation } from "react-i18next";
import CircularProgress from "@mui/material/CircularProgress";

const modal = createModal({
    "id": "declaration-removal",
    "isOpenedByDefault": false
});

type Params = {
    softwareId: number;
    softwareName: string;
    declarationType: "user" | "referent";
};

const evtParams = Evt.create<Params | undefined>(undefined);

evtParams.toStateless().attach(() => modal.open());

export function openDeclarationRemovalModal(params: Params) {
    evtParams.state = params;
}

export function DeclarationRemovalModal() {
    const { declarationRemoval } = useCore().functions;
    const { evtDeclarationRemoval } = useCore().evts;
    const isRemovingUserDeclaration = useCoreState(
        "declarationRemoval",
        "isRemovingUserDeclaration"
    );

    const { t } = useTranslation();

    useEvt(ctx =>
        evtDeclarationRemoval.attach(
            ({ action }) => action === "close modal",
            ctx,
            () => modal.close()
        )
    );

    useRerenderOnStateChange(evtParams);

    const params = evtParams.state;

    const {
        softwareName = "",
        softwareId = 0,
        declarationType = "referent"
    } = params ?? {};

    return (
        <modal.Component
            title={
                declarationType == "referent"
                    ? t("DeclarationRemovalModal.stop being_referent", { softwareName })
                    : t("DeclarationRemovalModal.stop being_user", { softwareName })
            }
            buttons={[
                {
                    "doClosesModal": true,
                    "children": t("DeclarationRemovalModal.cancel")
                },
                {
                    "doClosesModal": false,
                    "onClick": () =>
                        declarationRemoval.removeAgentAsReferentOrUserFromSoftware({
                            softwareId,
                            declarationType
                        }),
                    "nativeButtonProps": {
                        "disabled": isRemovingUserDeclaration
                    },
                    "children": (
                        <>
                            {t("DeclarationRemovalModal.confirm")}{" "}
                            {isRemovingUserDeclaration && (
                                <>
                                    &nbsp;&nbsp;&nbsp;
                                    <CircularProgress size={20} />
                                </>
                            )}
                        </>
                    )
                }
            ]}
        >
            {declarationType === "referent"
                ? t("DeclarationRemovalModal.do you confirm_referent")
                : t("DeclarationRemovalModal.do you confirm_using")}{" "}
            {softwareName} ?
        </modal.Component>
    );
}

export type DeclarationType = "user" | "referent";
export const { i18n } = declareComponentKeys<
    | "cancel"
    | "confirm"
    | {
          K: "stop being user/referent";
          P: { softwareName: string; declarationType: DeclarationType };
      }
    | "do you confirm_referent"
    | "do you confirm_using"
>()({ DeclarationRemovalModal });
