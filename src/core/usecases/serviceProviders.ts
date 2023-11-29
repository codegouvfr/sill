import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createSelector } from "redux-clean-architecture";
import { assert } from "tsafe/assert";
import { id } from "tsafe/id";
import type { State as RootState, Thunks } from "core/bootstrap";
import { selectors as softwareDetailsSelectors } from "core/usecases/softwareDetails/selectors";

export type ServiceProvider = {
    name: string;
    website?: string;
    cdlUrl?: string;
    cnllUrl?: string;
    siren?: string;
};

export type ServiceProvidersBySillId = Partial<Record<string, ServiceProvider[]>>;

export type State = State.NotReady | State.Ready | State.Errored;

export namespace State {
    export type NotReady = {
        stateDescription: "not ready";
    };

    export type Ready = {
        stateDescription: "ready";
        serviceProvidersBySillId: ServiceProvidersBySillId;
    };

    export type Errored = {
        stateDescription: "errored";
        errorMessage: string;
    };
}

export const name = "serviceProviders" as const;

export const { reducer, actions } = createSlice({
    name,
    "initialState": id<State>({
        stateDescription: "not ready"
    }),
    "reducers": {
        "serviceProvidersRequested": state => state,
        "serviceProvidersReceived": (
            _,
            action: PayloadAction<ServiceProvidersBySillId>
        ) => ({
            stateDescription: "ready",
            serviceProvidersBySillId: action.payload
        }),
        "serviceProvidersRequestFailed": (_, action: PayloadAction<string>) => ({
            stateDescription: "errored",
            errorMessage: action.payload
        })
    }
});

export const thunks = {} as Thunks;

export const protectedThunks = {
    "retrieveServiceProviders": () => async (dispatch, _, context) => {
        dispatch(actions.serviceProvidersRequested());
        context
            .getServiceProviders()
            .then(serviceProviders => {
                dispatch(actions.serviceProvidersReceived(serviceProviders));
            })
            .catch(error =>
                dispatch(actions.serviceProvidersRequestFailed(error.message))
            );
    }
} satisfies Thunks;

const serviceProvidersBySillId = (state: RootState) => {
    assert(state[name].stateDescription === "ready");
    return state[name].serviceProvidersBySillId;
};

export const selectors = {
    main: createSelector(
        serviceProvidersBySillId,
        softwareDetailsSelectors.main,
        (serviceProvidersBySillId, { software }): ServiceProvider[] => {
            if (!software) return [];
            return serviceProvidersBySillId[software.softwareId] ?? [];
        }
    )
};
