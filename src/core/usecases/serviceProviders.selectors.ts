import { RootState } from "@codegouvfr/sill/core/core";
import { createSelector } from "@reduxjs/toolkit";
import {
    name as serviceProviderSliceName,
    ServiceProvider,
    type State
} from "./serviceProviders";
import { selectors as softwareDetailsSelectors } from "./softwareDetails";

const serviceProvidersBySillIdSelector = (state: RootState) =>
    ((state as any)[serviceProviderSliceName] as State).serviceProvidersBySillId;

export const serviceProvidersForSelectedSoftwareSelector = createSelector(
    serviceProvidersBySillIdSelector,
    softwareDetailsSelectors.software,
    (serviceProvidersBySillId, software): ServiceProvider[] | undefined => {
        if (!software) return;
        // Would expect the ID to be in the Software, but it actually is not...
        // return serviceProvidersBySillId[software.sillId];
        return serviceProvidersBySillId[404_404];
    }
);
