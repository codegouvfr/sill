import type { Thunks, State as RootState } from "../core";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { id } from "tsafe/id";
import { assert } from "tsafe/assert";
import { createSelector } from "@reduxjs/toolkit";

export type State = State.NotReady | State.Ready;

export namespace State {
    export type NotReady = {
        stateDescription: "not ready";
        isInitializing: boolean;
    };

    export type Ready = {
        stateDescription: "ready";
        email: string;
        organization: string;
        about: string | undefined;
    };
}

export const name = "userProfile" as const;

export const { reducer, actions } = createSlice({
    name,
    "initialState": id<State>({
        "stateDescription": "not ready",
        "isInitializing": false
    }),
    "reducers": {
        "initializationStarted": () => ({
            "stateDescription": "not ready" as const,
            "isInitializing": true
        }),
        "initializationCompleted": (
            _state,
            {
                payload
            }: PayloadAction<{
                email: string;
                organization: string;
                about: string | undefined;
            }>
        ) => {
            const { about, email, organization } = payload;

            return {
                "stateDescription": "ready",
                email,
                organization,
                about
            };
        },
        "cleared": () => ({
            "stateDescription": "not ready" as const,
            "isInitializing": false
        })
    }
});

export const thunks = {
    "initialize":
        (params: { email: string }) =>
        async (...args) => {
            const { email } = params;

            const [dispatch, getState, extraArg] = args;

            {
                const state = getState()[name];

                assert(
                    state.stateDescription === "not ready",
                    "The clear function should have been called"
                );

                if (state.isInitializing) {
                    return;
                }
            }

            const { sillApi } = extraArg;

            dispatch(actions.initializationStarted());

            const agent = (await sillApi.getAgents()).agents.find(
                agent => agent.email === email
            );

            assert(agent !== undefined);

            const { organization } = agent;

            const about = await sillApi.getAgentAbout({ email });

            dispatch(
                actions.initializationCompleted({
                    email,
                    organization,
                    about
                })
            );
        },
    "clear":
        () =>
        (...args) => {
            const [dispatch, getState] = args;

            {
                const state = getState()[name];

                if (state.stateDescription === "not ready") {
                    return;
                }
            }

            dispatch(actions.cleared());
        }
} satisfies Thunks;

export const selectors = (() => {
    const readyState = (rootState: RootState) => {
        const state = rootState[name];

        if (state.stateDescription !== "ready") {
            return undefined;
        }

        return state;
    };

    const profile = createSelector(readyState, readyState => {
        if (readyState === undefined) {
            return undefined;
        }

        return {
            "email": readyState.email,
            "organization": readyState.organization,
            "about": readyState.about
        };
    });

    return { profile };
})();
