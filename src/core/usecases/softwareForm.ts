import type { Thunks, State as RootState, CreateEvt } from "../core";
import { createSelector } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { id } from "tsafe/id";
import { assert } from "tsafe/assert";
import type { ApiTypes } from "@codegouvfr/sill";
import { exclude } from "tsafe/exclude";
import type { LocalizedString } from "i18nifty";
import type { Language } from "@codegouvfr/sill";

type SoftwareFormState = SoftwareFormState.NotInitialized | SoftwareFormState.Ready;

namespace SoftwareFormState {
    export type NotInitialized = {
        stateDescription: "not ready";
        isInitializing: boolean;
    };

    export type Ready = {
        stateDescription: "ready";
        step: number;
        formData: Partial<FormData>;
        softwareSillId?: number;
        isSubmitting: boolean;
    };
}

export type FormData = {
    step1: {
        softwareType: ApiTypes.SoftwareType;
    };
    step2: {
        wikidataId: string | undefined;
        comptoirDuLibreId: number | undefined;
        softwareName: string;
        softwareDescription: string;
        softwareLicense: string;
        softwareMinimalVersion: string;
        softwareLogoUrl: string | undefined;
        softwareKeywords: string[];
    };
    step3: {
        isPresentInSupportContract: boolean | undefined;
        isFromFrenchPublicService: boolean;
    };
    step4: {
        similarSoftwares: {
            label: LocalizedString<Language>;
            description: LocalizedString<Language>;
            wikidataId: string;
        }[];
    };
};

export const name = "softwareForm" as const;

export const { reducer, actions } = createSlice({
    name,
    "initialState": id<SoftwareFormState>({
        "stateDescription": "not ready",
        "isInitializing": false
    }),
    "reducers": {
        "initializedForCreate": () =>
            id<SoftwareFormState.Ready>({
                "stateDescription": "ready",
                "formData": {},
                "softwareSillId": undefined,
                "step": 1,
                "isSubmitting": false
            }),
        "initializedForCreateWithPreSelectedSoftware": (
            _state,
            {
                payload
            }: PayloadAction<{
                wikidataId: string;
                comptoirDuLibreId: number | undefined;
                softwareName: string;
                softwareDescription: string;
                softwareLicense: string;
                softwareMinimalVersion: string;
                softwareLogoUrl: string | undefined;
                softwareKeywords: string[];
            }>
        ) => {
            const {
                wikidataId,
                comptoirDuLibreId,
                softwareName,
                softwareDescription,
                softwareLicense,
                softwareMinimalVersion,
                softwareLogoUrl,
                softwareKeywords
            } = payload;

            return id<SoftwareFormState.Ready>({
                "stateDescription": "ready",
                "formData": {
                    "step2": {
                        wikidataId,
                        comptoirDuLibreId,
                        softwareName,
                        softwareDescription,
                        softwareLicense,
                        softwareMinimalVersion,
                        softwareLogoUrl,
                        softwareKeywords
                    }
                },
                "softwareSillId": undefined,
                "step": 1,
                "isSubmitting": false
            });
        },
        "initializedForUpdate": (
            _state,
            {
                payload
            }: PayloadAction<{
                softwareSillId: number;
                formData: FormData;
            }>
        ) => {
            const { formData, softwareSillId } = payload;

            return {
                "stateDescription": "ready",
                "step": 1,
                softwareSillId,
                formData,
                "isSubmitting": false
            };
        },
        "initializationStarted": state => {
            assert(state.stateDescription === "not ready");
            state.isInitializing = true;
        },
        "step1DataSet": (
            state,
            {
                payload
            }: PayloadAction<{
                formDataStep1: FormData["step1"];
            }>
        ) => {
            const { formDataStep1 } = payload;

            assert(state.stateDescription === "ready");

            state.formData.step1 = formDataStep1;
            state.step++;
        },
        "step2DataSet": (
            state,
            {
                payload
            }: PayloadAction<{
                formDataStep2: FormData["step2"];
            }>
        ) => {
            const { formDataStep2 } = payload;

            assert(state.stateDescription === "ready");

            state.formData.step2 = formDataStep2;
            state.step++;
        },
        "step3DataSet": (
            state,
            {
                payload
            }: PayloadAction<{
                formDataStep3: FormData["step3"];
            }>
        ) => {
            const { formDataStep3 } = payload;

            assert(state.stateDescription === "ready");

            state.formData.step3 = formDataStep3;
            state.step++;
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
                //NOTE: To be registered by SoftwareCatalog
                payload: _payload
            }: PayloadAction<{
                softwareName: string;
            }>
        ) => {},
        "cleared": () => ({
            "stateDescription": "not ready" as const,
            "isInitializing": false
        })
    }
});

export const thunks = {
    "initialize":
        (
            params:
                | {
                      scenario: "create";
                      wikidataId: string | undefined;
                  }
                | {
                      scenario: "update";
                      softwareName: string;
                  }
        ) =>
        async (...args) => {
            const [dispatch, getState, { sillApi }] = args;

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

            if (params.scenario === "create" && params.wikidataId === undefined) {
                dispatch(actions.initializedForCreate());
                return;
            }

            dispatch(actions.initializationStarted());

            switch (params.scenario) {
                case "create":
                    {
                        const { wikidataId } = params;

                        assert(wikidataId !== undefined);

                        const {
                            comptoirDuLibreId,
                            keywords,
                            softwareDescription,
                            softwareLicense,
                            softwareLogoUrl,
                            softwareMinimalVersion,
                            softwareName
                        } = await dispatch(thunks.getAutofillData({ wikidataId }));

                        dispatch(
                            actions.initializedForCreateWithPreSelectedSoftware({
                                wikidataId,
                                comptoirDuLibreId,
                                "softwareName": softwareName ?? "",
                                "softwareDescription": softwareDescription ?? "",
                                "softwareLicense": softwareLicense ?? "",
                                "softwareMinimalVersion": softwareMinimalVersion ?? "",
                                softwareLogoUrl,
                                "softwareKeywords": keywords
                            })
                        );
                    }
                    break;
                case "update":
                    {
                        const softwares = await sillApi.getSoftwares();

                        const software = softwares.find(
                            software => software.softwareName === params.softwareName
                        );

                        assert(software !== undefined);

                        dispatch(
                            actions.initializedForUpdate({
                                "softwareSillId": software.softwareId,
                                "formData": {
                                    "step1": {
                                        "softwareType": software.softwareType
                                    },
                                    "step2": {
                                        "wikidataId": software.wikidataId,
                                        "comptoirDuLibreId": software.compotoirDuLibreId,
                                        "softwareDescription":
                                            software.softwareDescription,
                                        "softwareLicense": software.license,
                                        "softwareMinimalVersion": software.versionMin,
                                        "softwareName": software.softwareName,
                                        "softwareLogoUrl": software.logoUrl,
                                        "softwareKeywords": software.keywords
                                    },
                                    "step3": {
                                        "isPresentInSupportContract":
                                            software.prerogatives
                                                .isPresentInSupportContract,
                                        "isFromFrenchPublicService":
                                            software.prerogatives
                                                .isFromFrenchPublicServices
                                    },
                                    "step4": {
                                        "similarSoftwares": software.similarSoftwares
                                            .map(similarSoftware => {
                                                if (!similarSoftware.isInSill) {
                                                    return similarSoftware;
                                                } else {
                                                    const software = softwares.find(
                                                        software =>
                                                            software.softwareName ===
                                                            similarSoftware.softwareName
                                                    );

                                                    if (
                                                        software === undefined ||
                                                        software.wikidataId === undefined
                                                    ) {
                                                        return undefined;
                                                    }

                                                    return {
                                                        "label": software.softwareName,
                                                        "description":
                                                            software.softwareDescription,
                                                        "wikidataId": software.wikidataId,
                                                        "isLibreSoftware": true
                                                    };
                                                }
                                            })
                                            .filter(exclude(undefined))
                                    }
                                }
                            })
                        );
                    }
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
    "setStep1Data":
        (props: { formDataStep1: FormData["step1"] }) =>
        (...args) => {
            const { formDataStep1 } = props;

            const [dispatch] = args;

            dispatch(actions.step1DataSet({ formDataStep1 }));
        },
    "setStep2Data":
        (props: { formDataStep2: FormData["step2"] }) =>
        (...args) => {
            const { formDataStep2 } = props;

            const [dispatch] = args;

            dispatch(actions.step2DataSet({ formDataStep2 }));
        },
    "setStep3Data":
        (props: { formDataStep3: FormData["step3"] }) =>
        (...args) => {
            const { formDataStep3 } = props;

            const [dispatch] = args;

            dispatch(actions.step3DataSet({ formDataStep3 }));
        },
    "setStep4DataAndSubmit":
        (props: { formDataStep4: FormData["step4"] }) =>
        async (...args) => {
            const { formDataStep4 } = props;

            const [dispatch, getState, { sillApi }] = args;

            const state = getState()[name];

            assert(state.stateDescription === "ready");

            const { step1, step2, step3 } = state.formData;

            assert(step1 !== undefined);
            assert(step2 !== undefined);
            assert(step3 !== undefined);

            const formData: ApiTypes.SoftwareFormData = {
                "softwareType": step1.softwareType,
                "wikidataId": step2.wikidataId,
                "comptoirDuLibreId": step2.comptoirDuLibreId,
                "softwareName": step2.softwareName,
                "softwareDescription": step2.softwareDescription,
                "softwareLicense": step2.softwareLicense,
                "softwareMinimalVersion": step2.softwareMinimalVersion,
                "isPresentInSupportContract": step3.isPresentInSupportContract ?? false,
                "isFromFrenchPublicService": step3.isFromFrenchPublicService,
                "similarSoftwareWikidataIds": formDataStep4.similarSoftwares.map(
                    ({ wikidataId }) => wikidataId
                ),
                "softwareLogoUrl": step2.softwareLogoUrl,
                "softwareKeywords": step2.softwareKeywords
            };

            dispatch(actions.submissionStarted());

            await (state.softwareSillId !== undefined
                ? sillApi.updateSoftware({
                      "softwareSillId": state.softwareSillId,
                      formData
                  })
                : sillApi.createSoftware({
                      formData
                  }));

            dispatch(actions.formSubmitted({ "softwareName": step2.softwareName }));
        },
    "returnToPreviousStep":
        () =>
        (...args) => {
            const [dispatch] = args;

            dispatch(actions.navigatedToPreviousStep());
        },
    "getLibreSoftwareWikidataOptions":
        (props: { queryString: string; language: Language }) =>
        async (...args) => {
            const { queryString, language } = props;

            const [, , { sillApi }] = args;

            return (await sillApi.getWikidataOptions({ queryString, language })).filter(
                option => option.isLibreSoftware
            ); //TODO: Make sure we have all the license API side
        },
    "getWikidataOptions":
        (props: { queryString: string; language: Language }) =>
        async (...args) => {
            const { queryString, language } = props;

            const [, , { sillApi }] = args;

            return await sillApi.getWikidataOptions({ queryString, language });
        },
    "getAutofillData":
        (props: { wikidataId: string }) =>
        (...args) => {
            const { wikidataId } = props;

            const [, , extraArg] = args;

            return extraArg.sillApi.getSoftwareFormAutoFillDataFromWikidataAndOtherSources(
                { wikidataId }
            );
        }
} satisfies Thunks;

export const selectors = (() => {
    const readyState = (rootState: RootState) => {
        const state = rootState[name];

        if (state.stateDescription !== "ready") {
            return undefined;
        }

        return state;
    };

    const step = createSelector(readyState, readyState => readyState?.step);

    const formData = createSelector(readyState, readyState => readyState?.formData);

    const isSubmitting = createSelector(
        readyState,
        readyState => readyState?.isSubmitting ?? false
    );

    const isLastStep = createSelector(readyState, readyState => readyState?.step === 4);

    return { step, formData, isSubmitting, isLastStep };
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
