import type { Thunks } from "core/bootstrap";
import { actions } from "./state";

export const thunks = {
    "removeAgentAsReferentOrUserFromSoftware":
        (params: { softwareId: number; declarationType: "user" | "referent" }) =>
        async (...args) => {
            const { declarationType, softwareId } = params;

            const [dispatch, , { sillApi }] = args;

            dispatch(actions.declarationRemovalStarted());

            await sillApi.removeUserOrReferent({
                declarationType,
                softwareId
            });

            dispatch(actions.userOrReferentRemoved());
        }
} satisfies Thunks;
