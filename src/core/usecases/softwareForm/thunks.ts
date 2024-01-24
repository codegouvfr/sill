import type { Thunks } from "core/bootstrap";
import { assert } from "tsafe/assert";
import type { ApiTypes } from "@codegouvfr/sill";
import { exclude } from "tsafe/exclude";
import type { Language } from "@codegouvfr/sill";
import { name, actions, type FormData } from "./state";

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
                                        "comptoirDuLibreId": software.comptoirDuLibreId,
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
                                                .isFromFrenchPublicServices,
                                        "doRespectRgaa":
                                            software.prerogatives.doRespectRgaa
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
                "doRespectRgaa": step3.doRespectRgaa,
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

            return await sillApi.getWikidataOptions({ queryString, language });
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
