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
const logoUrl = createSelector(readyState, readyState => readyState?.logoUrl);
const users = createSelector(readyState, readyState => readyState?.users);
const referents = createSelector(readyState, readyState => readyState?.referents);

const main = createSelector(
    isReady,
    logoUrl,
    users,
    referents,
    (isReady, logoUrl, users, referents) => {
        if (!isReady) {
            return {
                isReady: false as const
            };
        }

        assert(users !== undefined);
        assert(referents !== undefined);

        return {
            isReady: true as const,
            logoUrl,
            users,
            referents
        };
    }
);

export const selectors = { main };
