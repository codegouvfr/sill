import { RootState } from "@codegouvfr/sill/core/core";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { id } from "tsafe/id";
import { Thunks } from "../core";

export type ServiceProvider = {
    name: string;
    website?: string;
    cdlUrl?: string;
    cnllUrl?: string;
    siren?: string;
};

export type ServiceProvidersBySillId = Partial<Record<number, ServiceProvider[]>>;

export type State = {
    serviceProvidersBySillId: ServiceProvidersBySillId;
    errorMessage: string | null;
};

export const name = "serviceProviders" as const;

export const { reducer, actions } = createSlice({
    name,
    "initialState": id<State>({
        serviceProvidersBySillId: {},
        errorMessage: null
    }),
    "reducers": {
        "serviceProvidersRequested": state => state,
        "serviceProvidersReceived": (
            state,
            action: PayloadAction<ServiceProvidersBySillId>
        ) => {
            state.serviceProvidersBySillId = action.payload;
        },
        "serviceProvidersRequestFailed": (state, action: PayloadAction<string>) => {
            state.errorMessage = action.payload;
        }
    }
});

export const thunks = {} satisfies Thunks;

export const privateThunks = {
    "retrieveServiceProviders": () => async (dispatch, _, extraArg) => {
        dispatch(actions.serviceProvidersRequested());
        extraArg
            .getServiceProviders()
            .then(serviceProviders => {
                dispatch(actions.serviceProvidersReceived(serviceProviders));
            })
            .catch(error =>
                dispatch(actions.serviceProvidersRequestFailed(error.message))
            );
    }
} satisfies Thunks;
