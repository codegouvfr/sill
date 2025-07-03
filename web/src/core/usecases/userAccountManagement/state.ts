import { assert } from "tsafe/assert";
import { createUsecaseActions } from "redux-clean-architecture";
import { id } from "tsafe/id";

export const name = "userAccountManagement";

type State = State.NotInitialized | State.Ready;

namespace State {
    export type NotInitialized = {
        stateDescription: "not initialized";
        isInitializing: boolean;
    };

    export type Ready = {
        stateDescription: "ready";
        accountManagementUrl: string | undefined;
        allOrganizations: string[];
        organization: {
            value: string | null;
            isBeingUpdated: boolean;
        };
        email: {
            value: string;
            isBeingUpdated: boolean;
        };
        aboutAndIsPublic: {
            isPublic: boolean;
            about: string;
            isBeingUpdated: boolean;
        };
    };
}

type UpdateFieldPayload =
    | {
          fieldName: "organization";
          value: string;
      }
    | {
          fieldName: "aboutAndIsPublic";
          about: string;
          isPublic: boolean;
      };

export const { reducer, actions } = createUsecaseActions({
    name,
    initialState: id<State>({
        stateDescription: "not initialized",
        isInitializing: false
    }),
    reducers: {
        initializeStarted: state => {
            assert(state.stateDescription === "not initialized");

            state.isInitializing = true;
        },
        initialized: (
            _state,
            {
                payload
            }: {
                payload: {
                    accountManagementUrl: string | undefined;
                    organization: string | null;
                    email: string;
                    allOrganizations: string[];
                    about: string;
                    isPublic: boolean;
                };
            }
        ) => {
            const {
                accountManagementUrl,
                organization,
                email,
                allOrganizations,
                about,
                isPublic
            } = payload;

            return {
                stateDescription: "ready",
                accountManagementUrl,
                allOrganizations,
                organization: {
                    value: organization,
                    isBeingUpdated: false
                },
                email: {
                    value: email,
                    isBeingUpdated: false
                },
                about: {
                    value: about,
                    isBeingUpdated: false
                },
                aboutAndIsPublic: {
                    about,
                    isPublic,
                    isBeingUpdated: false
                }
            };
        },
        updateFieldStarted: (state, { payload }: { payload: UpdateFieldPayload }) => {
            assert(state.stateDescription === "ready");

            if (payload.fieldName === "aboutAndIsPublic") {
                state[payload.fieldName] = {
                    about: payload.about,
                    isPublic: payload.isPublic,
                    isBeingUpdated: true
                };

                return;
            }

            state[payload.fieldName] = {
                value: payload.value,
                isBeingUpdated: true
            };
        },
        updateFieldCompleted: (state, { payload }: { payload: UpdateFieldPayload }) => {
            const { fieldName } = payload;

            assert(state.stateDescription === "ready");

            state[fieldName].isBeingUpdated = false;
        }
    }
});
