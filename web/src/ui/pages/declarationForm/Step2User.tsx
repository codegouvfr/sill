import { useState } from "react";
import { useForm } from "react-hook-form";
import type { NonPostableEvt } from "evt";
import { useEvt } from "evt/hooks";
import { assert } from "tsafe/assert";
import type { FormData } from "core/usecases/declarationForm";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { useTranslation } from "react-i18next";

type Props = {
    className?: string;
    onSubmit: (formData: FormData.User) => void;
    evtActionSubmit: NonPostableEvt<void>;
    softwareType: "desktop/mobile" | "cloud" | "other";
};

export function DeclarationFormStep2User(props: Props) {
    const { className, onSubmit, evtActionSubmit, softwareType } = props;

    const {
        handleSubmit,
        register,
        formState: { errors }
    } = useForm<{
        usecaseDescription: string;
        osSelectValue: "windows" | "linux" | "mac" | "";
        version: string;
        serviceUrlInputValue: string;
    }>({
        "defaultValues": {
            "osSelectValue": ""
        }
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

    const { t } = useTranslation();

    return (
        <form
            className={className}
            onSubmit={handleSubmit(
                ({ usecaseDescription, osSelectValue, version, serviceUrlInputValue }) =>
                    onSubmit({
                        "declarationType": "user",
                        usecaseDescription,
                        "os":
                            softwareType !== "desktop/mobile"
                                ? undefined
                                : (assert(osSelectValue !== ""), osSelectValue),
                        version,
                        "serviceUrl":
                            softwareType !== "cloud" ? undefined : serviceUrlInputValue
                    })
            )}
        >
            <Input
                label={t("declarationFormStep2User.useCase")}
                nativeInputProps={{
                    ...register("usecaseDescription", { "required": true })
                }}
                state={errors.usecaseDescription !== undefined ? "error" : undefined}
                stateRelatedMessage={t("app.required")}
            />
            {softwareType === "desktop/mobile" && (
                <Select
                    label={t("declarationFormStep2User.environment")}
                    nativeSelectProps={{
                        ...register("osSelectValue", { "required": true })
                    }}
                    state={errors.osSelectValue !== undefined ? "error" : undefined}
                    stateRelatedMessage={t("app.required")}
                >
                    <option value="" disabled hidden></option>
                    <option value="windows">Windows</option>
                    <option value="linux">GNU/Linux</option>
                    <option value="mac">MacOS</option>
                </Select>
            )}
            <Input
                label={t("declarationFormStep2User.version")}
                nativeInputProps={{
                    ...register("version", { "pattern": /^(\d+)((\.{1}\d+)*)(\.{0})$/ })
                }}
                state={errors.version !== undefined ? "error" : undefined}
                stateRelatedMessage={t("app.invalid version")}
            />
            {softwareType === "cloud" && (
                <Input
                    label={t("declarationFormStep2User.service")}
                    nativeInputProps={{
                        ...register("serviceUrlInputValue", {
                            "pattern": /^http/
                        })
                    }}
                    state={
                        errors.serviceUrlInputValue !== undefined ? "error" : undefined
                    }
                    stateRelatedMessage={t("app.invalid url")}
                />
            )}
            <button
                style={{ "display": "none" }}
                ref={setSubmitButtonElement}
                type="submit"
            />
        </form>
    );
}
