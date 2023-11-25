import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useCoreState, useCore } from "core";
import { Evt } from "evt";
import { useEvt } from "evt/hooks";
import { useRerenderOnStateChange } from "evt/hooks";
import { declareComponentKeys } from "i18nifty";
import { useTranslation } from "ui/i18n";
import CircularProgress from "@mui/material/CircularProgress";

const modal = createModal({
    "id": "declaration-removal",
    "isOpenedByDefault": false
});

type Params = {
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

    const { t } = useTranslation({ DeclarationRemovalModal });

    useEvt(ctx =>
        evtDeclarationRemoval.attach(
            ({ action }) => action === "close modal",
            ctx,
            () => modal.close()
        )
    );

    useRerenderOnStateChange(evtParams);

    const params = evtParams.state;

    const { softwareName = "", declarationType = "referent" } = params ?? {};

    return (
        <modal.Component
            title={t("stop being user/referent", { softwareName, declarationType })}
            buttons={[
                {
                    "doClosesModal": true,
                    "children": t("cancel")
                },
                {
                    "doClosesModal": false,
                    "onClick": () =>
                        declarationRemoval.removeAgentAsReferentOrUserFromSoftware({
                            softwareName,
                            declarationType
                        }),
                    "nativeButtonProps": {
                        "disabled": isRemovingUserDeclaration
                    },
                    "children": (
                        <>
                            {t("confirm")}{" "}
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
            {t("do you confirm", { softwareName, declarationType })}
        </modal.Component>
    );
}

export const { i18n } = declareComponentKeys<
    | "cancel"
    | "confirm"
    | {
          K: "stop being user/referent";
          P: { softwareName: string; declarationType: "user" | "referent" };
      }
    | {
          K: "do you confirm";
          P: { softwareName: string; declarationType: "user" | "referent" };
      }
>()({ DeclarationRemovalModal });
