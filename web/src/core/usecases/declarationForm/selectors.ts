import type { State as RootState } from "core/bootstrap";
import { createSelector } from "redux-clean-architecture";
import { name } from "./state";
import { assert } from "tsafe/assert";

const readyState = (rootState: RootState) => {
    const state = rootState[name];

    if (state.stateDescription === "not ready") {
        return undefined;
    }

    return state;
};

const isReady = createSelector(readyState, readyState => readyState !== undefined);

const step = createSelector(readyState, readyState => readyState?.step);

const isSubmitting = createSelector(readyState, readyState => readyState?.isSubmitting);

const declarationType = createSelector(
    readyState,
    readyState => readyState?.declarationType
);

const software = createSelector(readyState, readyState => readyState?.software);

const main = createSelector(
    isReady,
    step,
    isSubmitting,
    declarationType,
    software,
    (isReady, step, isSubmitting, declarationType, software) => {
        if (!isReady) {
            return {
                isReady: false as const
            };
        }

        assert(step !== undefined);
        assert(isSubmitting !== undefined);
        assert(software !== undefined);

        return {
            isReady: true as const,
            step,
            isSubmitting,
            declarationType,
            software
        };
    }
);

export const selectors = { main };
