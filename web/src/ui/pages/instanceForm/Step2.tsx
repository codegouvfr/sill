import { useState } from "react";
import { useForm } from "react-hook-form";
import type { NonPostableEvt } from "evt";
import { useEvt } from "evt/hooks";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { declareComponentKeys } from "i18nifty";
import { useTranslation } from "ui/i18n";

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

    const { t } = useTranslation({ InstanceFormStep2 });
    const { t: tCommon } = useTranslation({ "App": null });

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
                legend={t("is in public access label")}
                hintText={t("is in public access hint")}
                options={[
                    {
                        "label": tCommon("yes"),
                        "nativeInputProps": {
                            ...register("isPublic", {
                                "required": true
                            }),
                            "value": "true"
                        }
                    },
                    {
                        "label": tCommon("no"),
                        "nativeInputProps": {
                            ...register("isPublic", {
                                "required": true
                            }),
                            "value": "false"
                        }
                    }
                ]}
                state={errors.isPublic !== undefined ? "error" : undefined}
                stateRelatedMessage={tCommon("required")}
            />

            <Input
                label={t("instance url label")}
                hintText={t("instance url hint")}
                nativeInputProps={{
                    ...register("instanceUrl", {
                        "required": watch("isPublic") === "true",
                        "pattern": /^http/
                    })
                }}
                state={errors.instanceUrl !== undefined ? "error" : undefined}
                stateRelatedMessage={
                    errors.instanceUrl ? tCommon("invalid url") : tCommon("required")
                }
            />

            <Input
                label={t("organization label")}
                hintText={t("organization hint")}
                nativeInputProps={{
                    ...register("organization", { "required": true })
                }}
                state={errors.organization !== undefined ? "error" : undefined}
                stateRelatedMessage={tCommon("required")}
            />
            <Input
                label={t("targeted public label")}
                hintText={t("targeted public hint")}
                nativeInputProps={{
                    ...register("targetAudience", { "required": true })
                }}
                state={errors.targetAudience !== undefined ? "error" : undefined}
                stateRelatedMessage={tCommon("required")}
            />
            <button
                style={{ "display": "none" }}
                ref={setSubmitButtonElement}
                type="submit"
            />
        </form>
    );
}

export const { i18n } = declareComponentKeys<
    | "is in public access label"
    | "is in public access hint"
    | "instance url label"
    | "instance url hint"
    | "organization label"
    | "organization hint"
    | "targeted public label"
    | "targeted public hint"
>()({ InstanceFormStep2 });
