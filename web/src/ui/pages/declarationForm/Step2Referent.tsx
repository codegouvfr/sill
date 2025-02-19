import { useState } from "react";
import { useForm } from "react-hook-form";
import type { NonPostableEvt } from "evt";
import { useEvt } from "evt/hooks";
import type { FormData } from "core/usecases/declarationForm";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import { useTranslation } from "react-i18next";

type Props = {
    className?: string;
    onSubmit: (formData: FormData.Referent) => void;
    evtActionSubmit: NonPostableEvt<void>;
    softwareType: "cloud" | "other";
};

export function DeclarationFormStep2Referent(props: Props) {
    const { className, onSubmit, evtActionSubmit, softwareType } = props;

    const {
        handleSubmit,
        register,
        formState: { errors }
    } = useForm<{
        usecaseDescription: string;
        isTechnicalExpertInputValue: "true" | "false";
        serviceUrlInputValue: string;
    }>();

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

    const { t } = useTranslation();

    return (
        <form
            className={className}
            onSubmit={handleSubmit(
                ({
                    usecaseDescription,
                    isTechnicalExpertInputValue,
                    serviceUrlInputValue
                }) =>
                    onSubmit({
                        declarationType: "referent",
                        isTechnicalExpert: (() => {
                            switch (isTechnicalExpertInputValue) {
                                case "true":
                                    return true;
                                case "false":
                                    return false;
                            }
                        })(),
                        usecaseDescription,
                        serviceUrl:
                            softwareType !== "cloud" ? undefined : serviceUrlInputValue
                    })
            )}
        >
            <RadioButtons
                legend={t("declarationFormStep2Referent.legend title")}
                hintText={t("declarationFormStep2Referent.legend hint")}
                options={[
                    {
                        label: t("app.yes"),
                        nativeInputProps: {
                            ...register("isTechnicalExpertInputValue", {
                                required: true
                            }),
                            value: "true"
                        }
                    },
                    {
                        label: t("app.no"),
                        nativeInputProps: {
                            ...register("isTechnicalExpertInputValue", {
                                required: true
                            }),
                            value: "false"
                        }
                    }
                ]}
                state={
                    errors.isTechnicalExpertInputValue !== undefined ? "error" : undefined
                }
                stateRelatedMessage={t("app.required")}
            />

            <Input
                label={t("declarationFormStep2Referent.useCase")}
                nativeInputProps={{
                    ...register("usecaseDescription", { required: true })
                }}
                state={errors.usecaseDescription !== undefined ? "error" : undefined}
                stateRelatedMessage={t("app.required")}
            />
            {softwareType === "cloud" && (
                <Input
                    label={t("declarationFormStep2Referent.service")}
                    nativeInputProps={{
                        ...register("serviceUrlInputValue", {
                            pattern: /^http/
                        })
                    }}
                    state={
                        errors.serviceUrlInputValue !== undefined ? "error" : undefined
                    }
                    stateRelatedMessage={t("app.invalid url")}
                />
            )}
            <button
                style={{ display: "none" }}
                ref={setSubmitButtonElement}
                type="submit"
            />
        </form>
    );
}
