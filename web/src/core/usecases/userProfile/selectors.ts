import type { State as RootState } from "core/bootstrap";
import { createSelector } from "redux-clean-architecture";
import { name } from "./state";
import { assert } from "tsafe/assert";

const readyState = (rootState: RootState) => {
    const state = rootState[name];

    if (state.stateDescription !== "ready") {
        return undefined;
    }

    return state;
};

const isReady = createSelector(readyState, readyState => readyState !== undefined);

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
        if (a.isReferent && b.isReferent && a.isTechnicalExpert && !b.isTechnicalExpert) {
            return -1;
        }
        if (a.isReferent && b.isReferent && !a.isTechnicalExpert && b.isTechnicalExpert) {
            return 1;
        }
        return 0;
    });

    return softwares;
});

const main = createSelector(
    isReady,
    profile,
    softwares,
    (isReady, profile, softwares) => {
        if (!isReady) {
            return {
                "isReady": false as const
            };
        }

        assert(profile !== undefined);
        assert(softwares !== undefined);

        return {
            "isReady": true as const,
            profile,
            softwares
        };
    }
);

export const selectors = { main };
