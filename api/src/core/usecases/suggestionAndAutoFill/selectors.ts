import type { State as RootState } from "../../bootstrap";
import { createSelector } from "redux-clean-architecture";
import { exclude } from "tsafe/exclude";

export const selectors = undefined;

export const privateSelectors = (() => {
    const compiledData = (state: RootState) => state.readWriteSillData.compiledData;

    const sillWikidataIds = createSelector(compiledData, compiledData =>
        compiledData.map(software => software.softwareExternalData?.externalId).filter(exclude(undefined))
    );

    return { sillWikidataIds };
})();
