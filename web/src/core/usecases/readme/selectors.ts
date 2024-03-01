import type { State as RootState } from "core/bootstrap";
import { createSelector } from "redux-clean-architecture";
import { name } from "./state";

const readyState = (rootState: RootState) => {
    const state = rootState[name];

    if (state.stateDescription !== "ready") {
        return undefined;
    }

    return state;
};

const main = createSelector(readyState, state => {
    if (state === undefined) {
        return {
            "isReady": false as const
        };
    }

    const { markdown } = state;

    return {
        "isReady": true,
        markdown
    };
});

export const selectors = { main };
