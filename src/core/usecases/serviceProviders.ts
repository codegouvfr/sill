import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createSelector } from "redux-clean-architecture";
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

const serviceProvidersBySillId = (state: RootState) =>
    state[name].serviceProvidersBySillId;

export const selectors = {
    main: createSelector(
        serviceProvidersBySillId,
        softwareDetailsSelectors.main,
        (serviceProvidersBySillId, { software }): ServiceProvider[] => {
            console.log("YO >", {
                software,
                providers: software
                    ? serviceProvidersBySillId[software.softwareName]
                    : "pas de software"
            });
            if (!software) return [];
            return serviceProvidersBySillId[software.softwareName] ?? [];
        }
    )
};
