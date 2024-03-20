import { useState } from "react";
import { useForm } from "react-hook-form";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import type { NonPostableEvt } from "evt";
import { useEvt } from "evt/hooks";
import { assert } from "tsafe/assert";
import { declareComponentKeys } from "i18nifty";
import { useTranslation } from "ui/i18n";

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
        "defaultValues": {
            "declarationType": undefined
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

    const { t } = useTranslation({ DeclarationFormStep1 });
    const { t: tCommon } = useTranslation({ "App": "App" });

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
                        "label": t("user type label"),
                        "hintText": t("user type hint"),
                        "nativeInputProps": {
                            ...register("declarationType", { "required": true }),
                            "value": "user"
                        }
                    },
                    {
                        "label": t("referent type label"),
                        "hintText": t("referent type label"),
                        "nativeInputProps": {
                            ...register("declarationType", { "required": true }),
                            "value": "referent"
                        }
                    }
                ]}
                state={errors.declarationType !== undefined ? "error" : undefined}
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
    "user type label" | "user type hint" | "referent type label" | "referent type hint"
>()({
    DeclarationFormStep1
});
