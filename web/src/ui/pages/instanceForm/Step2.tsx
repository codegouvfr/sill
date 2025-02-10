import { useState } from "react";
import { useForm } from "react-hook-form";
import type { NonPostableEvt } from "evt";
import { useEvt } from "evt/hooks";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { useTranslation } from "react-i18next";

export type Step1Props = {
    className?: string;
    initialFormData: {
        organization: string | undefined;
        targetAudience: string | undefined;
        instanceUrl: string | undefined;
        isPublic: "true" | "false" | null;
    };
    onSubmit: (formData: {
        organization: string;
        targetAudience: string;
        instanceUrl: string | undefined;
        isPublic: "true" | "false" | null;
    }) => void;
    evtActionSubmit: NonPostableEvt<void>;
};

export function InstanceFormStep2(props: Step1Props) {
    const { className, initialFormData, onSubmit, evtActionSubmit } = props;

    const {
        handleSubmit,
        formState: { errors },
        register,
        watch
    } = useForm<{
        organization: string;
        targetAudience: string;
        instanceUrl: string | undefined;
        isPublic: "true" | "false" | null;
    }>({
        "defaultValues": {
            "organization": initialFormData.organization,
            "targetAudience": initialFormData.targetAudience,
            "instanceUrl": initialFormData.instanceUrl,
            "isPublic": initialFormData.isPublic
        }
    });

    const [submitButtonElement, setSubmitButtonElement] =
        useState<HTMLButtonElement | null>(null);

    const { t } = useTranslation();

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
                ({ organization, targetAudience, instanceUrl, isPublic }) =>
                    onSubmit({
                        organization,
                        instanceUrl: instanceUrl || undefined,
                        isPublic,
                        targetAudience
                    })
            )}
        >
            <RadioButtons
                legend={t("instanceFormStep2.is in public access label")}
                hintText={t("instanceFormStep2.is in public access hint")}
                options={[
                    {
                        "label": t("app.yes"),
                        "nativeInputProps": {
                            ...register("isPublic", {
                                "required": true
                            }),
                            "value": "true"
                        }
                    },
                    {
                        "label": t("app.no"),
                        "nativeInputProps": {
                            ...register("isPublic", {
                                "required": true
                            }),
                            "value": "false"
                        }
                    }
                ]}
                state={errors.isPublic !== undefined ? "error" : undefined}
                stateRelatedMessage={t("app.required")}
            />

            <Input
                label={t("instanceFormStep2.instance url label")}
                hintText={t("instanceFormStep2.instance url hint")}
                nativeInputProps={{
                    ...register("instanceUrl", {
                        "required": watch("isPublic") === "true",
                        "pattern": /^http/
                    })
                }}
                state={errors.instanceUrl !== undefined ? "error" : undefined}
                stateRelatedMessage={
                    errors.instanceUrl ? t("app.invalid url") : t("app.required")
                }
            />

            <Input
                label={t("instanceFormStep2.organization label")}
                hintText={t("instanceFormStep2.organization hint")}
                nativeInputProps={{
                    ...register("organization", { "required": true })
                }}
                state={errors.organization !== undefined ? "error" : undefined}
                stateRelatedMessage={t("app.required")}
            />
            <Input
                label={t("instanceFormStep2.targeted public label")}
                hintText={t("instanceFormStep2.targeted public hint")}
                nativeInputProps={{
                    ...register("targetAudience", { "required": true })
                }}
                state={errors.targetAudience !== undefined ? "error" : undefined}
                stateRelatedMessage={t("app.required")}
            />
            <button
                style={{ "display": "none" }}
                ref={setSubmitButtonElement}
                type="submit"
            />
        </form>
    );
}
