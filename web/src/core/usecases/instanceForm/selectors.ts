// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import type { State as RootState } from "core/bootstrap";
import { createSelector } from "redux-clean-architecture";
import { name } from "./state";
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
              organization: string | undefined;
              targetAudience: string | undefined;
              instanceUrl: string | undefined;
              isPublic: boolean | null;
          } => {
        if (readyState === undefined) {
            return undefined;
        }

        const { preFillData } = readyState;

        if (preFillData === undefined) {
            return {
                mainSoftwareSillId: undefined,
                organization: undefined,
                targetAudience: undefined,
                instanceUrl: undefined,
                isPublic: null
            };
        }

        switch (preFillData.type) {
            case "update":
                return {
                    mainSoftwareSillId: preFillData.mainSoftwareSillId,
                    organization: preFillData.organization,
                    targetAudience: preFillData.targetAudience,
                    instanceUrl: preFillData.instanceUrl,
                    isPublic: preFillData.isPublic
                };
            case "navigated from software form":
                return {
                    mainSoftwareSillId: preFillData.justRegisteredSoftwareSillId,
                    organization: undefined,
                    instanceUrl: undefined,
                    targetAudience: undefined,
                    isPublic: null
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
                isReady: false as const
            };

        assert(step !== undefined);
        assert(initializationData !== undefined);
        assert(allSillSoftwares !== undefined);
        assert(isSubmitting !== undefined);
        assert(isLastStep !== undefined);

        return {
            isReady: true as const,
            step,
            initializationData,
            allSillSoftwares,
            isSubmitting,
            isLastStep
        };
    }
);

export const selectors = { main };
