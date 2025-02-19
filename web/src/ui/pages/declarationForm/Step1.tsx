import { useState } from "react";
import { useForm } from "react-hook-form";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import type { NonPostableEvt } from "evt";
import { useEvt } from "evt/hooks";
import { assert } from "tsafe/assert";
import { useTranslation } from "react-i18next";

type Props = {
    className?: string;
    onSubmit: (formData: { declarationType: "user" | "referent" }) => void;
    evtActionSubmit: NonPostableEvt<void>;
};

export function DeclarationFormStep1(props: Props) {
    const { className, onSubmit, evtActionSubmit } = props;

    const {
        handleSubmit,
        register,
        formState: { errors }
    } = useForm<{
        declarationType: "user" | "referent" | undefined;
    }>({
        defaultValues: {
            declarationType: undefined
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
            onSubmit={handleSubmit(({ declarationType }) => {
                assert(declarationType !== undefined);

                onSubmit({ declarationType });
            })}
        >
            <RadioButtons
                name="radio"
                options={[
                    {
                        label: t("declarationFormStep1.user type label"),
                        hintText: t("declarationFormStep1.user type hint"),
                        nativeInputProps: {
                            ...register("declarationType", { required: true }),
                            value: "user"
                        }
                    },
                    {
                        label: t("declarationFormStep1.referent type label"),
                        hintText: t("declarationFormStep1.referent type label"),
                        nativeInputProps: {
                            ...register("declarationType", { required: true }),
                            value: "referent"
                        }
                    }
                ]}
                state={errors.declarationType !== undefined ? "error" : undefined}
                stateRelatedMessage={t("app.required")}
            />
            <button
                style={{ display: "none" }}
                ref={setSubmitButtonElement}
                type="submit"
            />
        </form>
    );
}
