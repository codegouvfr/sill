import type { Thunks } from "core/bootstrap";
import { actions } from "./state";

export const thunks = {
    "removeAgentAsReferentOrUserFromSoftware":
        (params: { softwareName: string; declarationType: "user" | "referent" }) =>
        async (...args) => {
            const { declarationType, softwareName } = params;

            const [dispatch, , { sillApi }] = args;

            dispatch(actions.declarationRemovalStarted());

            await sillApi.removeUserOrReferent({
                declarationType,
                softwareName
            });

            dispatch(actions.userOrReferentRemoved());
        }
} satisfies Thunks;
