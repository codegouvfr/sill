import type { Thunks, State as RootState } from "../core";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { id } from "tsafe/id";
import { assert } from "tsafe/assert";
import { createSelector } from "@reduxjs/toolkit";
import type { ApiTypes } from "@codegouvfr/sill";

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
        declarations: ApiTypes.Agent["declarations"];
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
                declarations: ApiTypes.Agent["declarations"];
            }>
        ) => {
            const { about, email, organization, isHimself, declarations } = payload;

            return {
                "stateDescription": "ready",
                email,
                organization,
                about,
                isHimself,
                declarations
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
                    "declarations": agent.declarations,
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

    const softwares = createSelector(readyState, readyState => {
        if (readyState === undefined) {
            return undefined;
        }

        const softwares: {
            softwareName: string;
            isReferent: boolean;
            // Only defined if isReferent is true
            isTechnicalExpert?: boolean;
            isUser: boolean;
            usecaseDescription: string;
        }[] = [];

        for (const declaration of readyState.declarations) {
            let software = softwares.find(
                software => software.softwareName === declaration.softwareName
            );

            if (software === undefined) {
                software = {
                    "softwareName": declaration.softwareName,
                    "isReferent": false,
                    "isUser": false,
                    "usecaseDescription": ""
                };

                softwares.push(software);
            }

            switch (declaration.declarationType) {
                case "referent":
                    software.isReferent = true;
                    software.isTechnicalExpert = declaration.isTechnicalExpert;
                    break;
                case "user":
                    software.isUser = true;
                    break;
            }

            software.usecaseDescription = declaration.usecaseDescription;
        }

        softwares.sort((a, b) => {
            if (a.isReferent && !b.isReferent) {
                return -1;
            }
            if (!a.isReferent && b.isReferent) {
                return 1;
            }
            return 0;
        });

        softwares.sort((a, b) => {
            if (
                a.isReferent &&
                b.isReferent &&
                a.isTechnicalExpert &&
                !b.isTechnicalExpert
            ) {
                return -1;
            }
            if (
                a.isReferent &&
                b.isReferent &&
                !a.isTechnicalExpert &&
                b.isTechnicalExpert
            ) {
                return 1;
            }
            return 0;
        });

        return softwares;
    });

    return { profile, softwares };
})();
