// SPDX-FileCopyrightText: 2021-2025 DINUM <floss@numerique.gouv.fr>
// SPDX-FileCopyrightText: 2024-2025 Université Grenoble Alpes
// SPDX-License-Identifier: MIT

import { useState } from "react";
import { useForm } from "react-hook-form";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import type { NonPostableEvt } from "evt";
import { useEvt } from "evt/hooks";
import type { FormData } from "core/usecases/softwareForm";
import { useTranslation } from "react-i18next";

export type Step2Props = {
    className?: string;
    isCloudNativeSoftware: boolean;
    initialFormData: FormData["step3"] | undefined;
    onSubmit: (formData: FormData["step3"]) => void;
    evtActionSubmit: NonPostableEvt<void>;
};

type DoRespectRgaaInputValue = "true" | "false" | "not applicable";

export function SoftwareFormStep3(props: Step2Props) {
    const { className, initialFormData, onSubmit, evtActionSubmit } = props;

    const { t } = useTranslation();

    const {
        handleSubmit,
        register,
        formState: { errors }
    } = useForm<{
        isPresentInSupportContractInputValue: "true" | "false" | undefined;
        doRespectRgaaInputValue: DoRespectRgaaInputValue;
        isFromFrenchPublicServiceInputValue: "true" | "false";
        isPublicInstanceInputValue: "true" | "false";
        targetAudience: string;
    }>({
        defaultValues: (() => {
            if (initialFormData === undefined) {
                return undefined;
            }

            const {
                isFromFrenchPublicService,
                isPresentInSupportContract,
                doRespectRgaa
            } = initialFormData;

            return {
                isPresentInSupportContractInputValue:
                    isPresentInSupportContract === undefined
                        ? undefined
                        : isPresentInSupportContract
                          ? "true"
                          : "false",
                doRespectRgaaInputValue: ((): DoRespectRgaaInputValue => {
                    if (doRespectRgaa === null) return "not applicable";
                    return doRespectRgaa ? "true" : "false";
                })(),
                isFromFrenchPublicServiceInputValue:
                    isFromFrenchPublicService === undefined
                        ? undefined
                        : isFromFrenchPublicService
                          ? "true"
                          : "false"
            };
        })()
    });

    const [submitButtonElement, setSubmitButtonElement] =
        useState<HTMLButtonElement | null>(null);

    useEvt(
        ctx => {
            if (submitButtonElement === null) {
                return;
            }

            evtActionSubmit.attach(ctx, () => submitButtonElement.click());
        },
        [evtActionSubmit, submitButtonElement]
    );

    return (
        <form
            className={className}
            onSubmit={handleSubmit(
                ({
                    isPresentInSupportContractInputValue,
                    isFromFrenchPublicServiceInputValue,
                    doRespectRgaaInputValue
                }) =>
                    onSubmit({
                        isPresentInSupportContract: (() => {
                            switch (isPresentInSupportContractInputValue) {
                                case undefined:
                                    return undefined;
                                case "true":
                                    return true;
                                case "false":
                                    return false;
                            }
                        })(),
                        doRespectRgaa: (() => {
                            switch (doRespectRgaaInputValue) {
                                case "true":
                                    return true;
                                case "false":
                                    return false;
                                case "not applicable":
                                default:
                                    return null;
                            }
                        })(),
                        isFromFrenchPublicService: (() => {
                            switch (isFromFrenchPublicServiceInputValue) {
                                case "true":
                                    return true;
                                case "false":
                                    return false;
                            }
                        })()
                    })
            )}
        >
            <RadioButtons
                legend={t("softwareFormStep3.is present in support market")}
                options={[
                    {
                        label: t("app.yes"),
                        nativeInputProps: {
                            ...register("isPresentInSupportContractInputValue"),
                            value: "true"
                        }
                    },
                    {
                        label: t("app.no"),
                        nativeInputProps: {
                            ...register("isPresentInSupportContractInputValue"),
                            value: "false"
                        }
                    }
                ]}
            />
            <RadioButtons
                legend={t("softwareFormStep3.is from french public service")}
                options={[
                    {
                        label: t("app.yes"),
                        nativeInputProps: {
                            ...register("isFromFrenchPublicServiceInputValue", {
                                required: true
                            }),
                            value: "true"
                        }
                    },
                    {
                        label: t("app.no"),
                        nativeInputProps: {
                            ...register("isFromFrenchPublicServiceInputValue", {
                                required: true
                            }),
                            value: "false"
                        }
                    }
                ]}
                state={
                    errors.isFromFrenchPublicServiceInputValue !== undefined
                        ? "error"
                        : undefined
                }
                stateRelatedMessage={t("app.required")}
            />
            <RadioButtons
                legend={t("softwareFormStep3.do respect RGAA")}
                options={[
                    {
                        label: t("app.yes"),
                        nativeInputProps: {
                            ...register("doRespectRgaaInputValue"),
                            value: "true"
                        }
                    },
                    {
                        label: t("app.no"),
                        nativeInputProps: {
                            ...register("doRespectRgaaInputValue"),
                            value: "false"
                        }
                    },
                    {
                        label: t("app.not applicable"),
                        nativeInputProps: {
                            ...register("doRespectRgaaInputValue"),
                            value: "not applicable"
                        }
                    }
                ]}
            />
            <button
                style={{ display: "none" }}
                ref={setSubmitButtonElement}
                type="submit"
            />
        </form>
    );
}
