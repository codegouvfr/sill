import type { State as RootState } from "core/bootstrap";
import { name } from "./state";

const main = (rootState: RootState) => {
    const state = rootState[name];

    if (state.stateDescription !== "ready") {
        return undefined;
    }

    const { stateDescription, passwordResetUrlWithoutLangParam, ...rest } = state;

    return {
        ...rest,
        "doSupportPasswordReset": passwordResetUrlWithoutLangParam !== undefined
    };
};

export const selectors = { main };
