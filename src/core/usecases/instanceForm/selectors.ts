import type { State as RootState } from "core/bootstrap";
import { createSelector } from "redux-clean-architecture";
import { name, type WikidataEntry } from "./state";
import { assert } from "tsafe/assert";

const readyState = (rootState: RootState) => {
    const state = rootState[name];

    if (state.stateDescription === "not ready") {
        return undefined;
    }

    return state;
};

const step = createSelector(readyState, readyState => readyState?.step);

const initializationData = createSelector(
    readyState,
    (
        readyState
    ):
        | undefined
        | {
              mainSoftwareSillId: number | undefined;
              otherSoftwares: WikidataEntry[];
              organization: string | undefined;
              publicUrl: string | undefined;
              targetAudience: string | undefined;
          } => {
        if (readyState === undefined) {
            return undefined;
        }

        const { preFillData } = readyState;

        if (preFillData === undefined) {
            return {
                "mainSoftwareSillId": undefined,
                "otherSoftwares": [],
                "organization": undefined,
                "publicUrl": undefined,
                "targetAudience": undefined
            };
        }

        switch (preFillData.type) {
            case "update":
                return {
                    "mainSoftwareSillId": preFillData.mainSoftwareSillId,
                    "otherSoftwares": preFillData.otherWikidataSoftwares,
                    "organization": preFillData.organization,
                    "publicUrl": preFillData.publicUrl,
                    "targetAudience": preFillData.targetAudience
                };
            case "navigated from software form":
                return {
                    "mainSoftwareSillId": preFillData.justRegisteredSoftwareSillId,
                    "otherSoftwares": [],
                    "organization": undefined,
                    "publicUrl": undefined,
                    "targetAudience": undefined
                };
        }
    }
);

const isSubmitting = createSelector(
    readyState,
    readyState => readyState?.isSubmitting ?? false
);

const allSillSoftwares = createSelector(
    readyState,
    readyState => readyState?.allSillSoftwares
);

const isLastStep = createSelector(readyState, readyState => readyState?.step === 2);

const isReady = createSelector(readyState, readyState => readyState !== undefined);

const main = createSelector(
    isReady,
    step,
    initializationData,
    allSillSoftwares,
    isSubmitting,
    isLastStep,
    (isReady, step, initializationData, allSillSoftwares, isSubmitting, isLastStep) => {
        if (!isReady)
            return {
                "isReady": false as const
            };

        assert(step !== undefined);
        assert(initializationData !== undefined);
        assert(allSillSoftwares !== undefined);
        assert(isSubmitting !== undefined);
        assert(isLastStep !== undefined);

        return {
            "isReady": true as const,
            step,
            initializationData,
            allSillSoftwares,
            isSubmitting,
            isLastStep
        };
    }
);

export const selectors = { main };
