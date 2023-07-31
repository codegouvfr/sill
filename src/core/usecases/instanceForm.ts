import type { Thunks, State as RootState, CreateEvt } from "../core";
import { createSelector } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { id } from "tsafe/id";
import { assert } from "tsafe/assert";
import type { ApiTypes } from "@codegouvfr/sill";
import type { LocalizedString } from "i18nifty";
import type { Language } from "@codegouvfr/sill";

export type WikidataEntry = {
    label: LocalizedString<Language>;
    description: LocalizedString<Language>;
    wikidataId: string;
};

type State = State.NotInitialized | State.Ready;

namespace State {
    export type NotInitialized = {
        stateDescription: "not ready";
        isInitializing: boolean;
    };

    export type Ready = {
        stateDescription: "ready";
        step: 1 | 2;
        /** Defined when update */
        preFillData:
            | {
                  type: "update";
                  instanceId: number;
                  mainSoftwareSillId: number;
                  otherWikidataSoftwares: WikidataEntry[];
                  organization: string;
                  publicUrl: string | undefined;
                  targetAudience: string;
              }
            | {
                  type: "navigated from software form";
                  justRegisteredSoftwareSillId: number;
                  userOrganization: string;
              }
            | undefined;
        step1Data:
            | {
                  mainSoftwareSillId: number;
                  otherWikidataSoftwares: WikidataEntry[];
              }
            | undefined;
        isSubmitting: boolean;
        allSillSoftwares: {
            softwareName: string;
            softwareSillId: number;
            softwareDescription: string;
        }[];
    };
}

export const name = "instanceForm" as const;

export const { reducer, actions } = createSlice({
    name,
    "initialState": id<State>({
        "stateDescription": "not ready",
        "isInitializing": false
    }),
    "reducers": {
        "initializationStarted": state => {
            assert(state.stateDescription === "not ready");
            state.isInitializing = true;
        },
        "initializationCompleted": (
            _state,
            {
                payload
            }: PayloadAction<{
                preFillData: State.Ready["preFillData"];
                allSillSoftwares: {
                    softwareName: string;
                    softwareSillId: number;
                    softwareDescription: string;
                }[];
            }>
        ) => {
            const { preFillData, allSillSoftwares } = payload;

            return {
                "stateDescription": "ready",
                "step": 1,
                preFillData,
                "step1Data": undefined,
                "isSubmitting": false,
                allSillSoftwares
            };
        },
        "cleared": () => ({
            "stateDescription": "not ready" as const,
            "isInitializing": false
        }),
        "step1Completed": (
            state,
            {
                payload
            }: PayloadAction<{
                step1Data: NonNullable<State.Ready["step1Data"]>;
            }>
        ) => {
            const { step1Data } = payload;

            assert(state.stateDescription === "ready");

            state.step1Data = step1Data;
            state.step = 2;
        },
        "navigatedToPreviousStep": state => {
            assert(state.stateDescription === "ready");
            state.step--;
        },
        "submissionStarted": state => {
            assert(state.stateDescription === "ready");
            state.isSubmitting = true;
        },
        "formSubmitted": (
            _state,
            {
                payload: _payload
            }: PayloadAction<{
                softwareName: string;
            }>
        ) => {}
    }
});

export const thunks = {
    "initialize":
        (
            params:
                | {
                      type: "update";
                      instanceId: number;
                  }
                | {
                      type: "create";
                      softwareName: string | undefined;
                  }
        ) =>
        async (...args) => {
            const [dispatch, getState, { sillApi, getUser, oidc }] = args;

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

            dispatch(actions.initializationStarted());

            const softwares = await sillApi.getSoftwares();

            const allSillSoftwares = softwares.map(
                ({ softwareName, softwareId, softwareDescription }) => ({
                    softwareDescription,
                    "softwareSillId": softwareId,
                    softwareName
                })
            );

            switch (params.type) {
                case "update":
                    const instance = (await sillApi.getInstances()).find(
                        instance => instance.id === params.instanceId
                    );

                    assert(instance !== undefined);

                    dispatch(
                        actions.initializationCompleted({
                            allSillSoftwares,
                            "preFillData": {
                                "type": "update",
                                "instanceId": instance.id,
                                "mainSoftwareSillId": instance.mainSoftwareSillId,
                                "otherWikidataSoftwares": instance.otherWikidataSoftwares,
                                "organization": instance.organization,
                                "publicUrl": instance.publicUrl,
                                "targetAudience": instance.targetAudience
                            }
                        })
                    );

                    break;
                case "create":
                    const software =
                        params.softwareName === undefined
                            ? undefined
                            : softwares.find(
                                  software =>
                                      software.softwareName === params.softwareName
                              );

                    assert(oidc.isUserLoggedIn);

                    const user = await getUser();

                    dispatch(
                        actions.initializationCompleted({
                            allSillSoftwares,
                            "preFillData":
                                software === undefined
                                    ? undefined
                                    : {
                                          "type": "navigated from software form",
                                          "justRegisteredSoftwareSillId":
                                              software.softwareId,
                                          "userOrganization": user.organization
                                      }
                        })
                    );

                    break;
            }
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
        },
    "completeStep1":
        (props: {
            mainSoftwareSillId: number;
            otherWikidataSoftwares: WikidataEntry[];
        }) =>
        (...args) => {
            const { mainSoftwareSillId, otherWikidataSoftwares } = props;

            const [dispatch] = args;

            dispatch(
                actions.step1Completed({
                    "step1Data": {
                        mainSoftwareSillId,
                        otherWikidataSoftwares
                    }
                })
            );
        },
    "submit":
        (props: {
            targetAudience: string;
            publicUrl: string | undefined;
            organization: string;
        }) =>
        async (...args) => {
            const { targetAudience, publicUrl, organization } = props;

            const [dispatch, getState, { sillApi }] = args;

            const state = getState()[name];

            assert(state.stateDescription === "ready");

            const { step1Data } = state;

            assert(step1Data !== undefined);

            const formData: ApiTypes.InstanceFormData = {
                "mainSoftwareSillId": step1Data.mainSoftwareSillId,
                organization,
                "otherSoftwareWikidataIds": step1Data.otherWikidataSoftwares.map(
                    ({ wikidataId }) => wikidataId
                ),
                publicUrl,
                targetAudience
            };

            let instanceId =
                state.preFillData?.type !== "update"
                    ? undefined
                    : state.preFillData.instanceId;

            dispatch(actions.submissionStarted());

            if (instanceId !== undefined) {
                await sillApi.updateInstance({
                    formData,
                    instanceId
                });
            } else {
                instanceId = (
                    await sillApi.createInstance({
                        formData
                    })
                ).instanceId;
            }

            const software = (await sillApi.getSoftwares()).find(
                software => software.softwareId === formData.mainSoftwareSillId
            );

            assert(software !== undefined);

            dispatch(actions.formSubmitted({ "softwareName": software.softwareName }));
        },
    "returnToPreviousStep":
        () =>
        (...args) => {
            const [dispatch] = args;

            dispatch(actions.navigatedToPreviousStep());
        }
} satisfies Thunks;

export const selectors = (() => {
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

    return { step, initializationData, allSillSoftwares, isSubmitting, isLastStep };
})();

export const createEvt = (({ evtAction }) =>
    evtAction.pipe(action =>
        action.sliceName === name && action.actionName === "formSubmitted"
            ? [
                  {
                      "action": "redirect" as const,
                      "softwareName": action.payload.softwareName
                  }
              ]
            : null
    )) satisfies CreateEvt;
