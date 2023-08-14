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
        isHimself: boolean;
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
                isHimself: boolean;
            }>
        ) => {
            const { about, email, organization, isHimself } = payload;

            return {
                "stateDescription": "ready",
                email,
                organization,
                about,
                isHimself
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

            const { sillApi, getUser, oidc } = extraArg;

            dispatch(actions.initializationStarted());

            if (
                !oidc.isUserLoggedIn &&
                !(await sillApi.getIsAgentProfilePublic({ email }))
            ) {
                await oidc.login({
                    "doesCurrentHrefRequiresAuth": true
                });
                assert(false, "never");
            }

            const { agent } = await sillApi.getAgent({ email });

            assert(agent !== undefined);

            const isHimself = !oidc.isUserLoggedIn
                ? false
                : (await getUser()).email === email;

            dispatch(
                actions.initializationCompleted({
                    email,
                    "about": agent.about,
                    "organization": agent.organization,
                    isHimself
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
            "about": readyState.about,
            "isHimself": readyState.isHimself
        };
    });

    return { profile };
})();
